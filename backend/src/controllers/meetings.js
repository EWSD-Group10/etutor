import { prisma } from "../utils/prisma.js"
import { getUserBasic, hasStudentTutorLink } from "../utils/relationship.js"
import { createNotification } from "./notifications.js"

const meetingSelect = {
  id: true,
  meetingType: true,
  meetingStatus: true,
  scheduledDate: true,
  durationMinutes: true,
  location: true,
  meetingLink: true,
  meetingName: true,
  createdAt: true,
  student: { select: { id: true, name: true, email: true } },
  tutor: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true, role: true } },
}

// Map to API shape (scheduledAt, notes) for frontend compatibility
function toMeetingApi(m) {
  if (!m) return m
  return {
    ...m,
    scheduledAt: m.scheduledDate,
    notes: m.meetingName ?? null,
  }
}

const VALID_TYPES = new Set(["virtual", "in_person"])
const VALID_STATUSES = new Set(["scheduled", "completed", "cancelled"])

// GET /api/meetings
export const listMeetings = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const status = req.query.status
    const skip = (page - 1) * limit

    const me = await getUserBasic(userId)
    if (!me) return res.status(404).json({ error: "User not found" })

    // Build where clause
    let where = {}
    if (me.role === "student") {
      where = { studentId: userId }
    } else if (me.role === "tutor") {
      where = { tutorId: userId }
    } else {
      return res.status(403).json({ error: "Only students and tutors can view meetings" })
    }

    // Add status filter if provided
    if (status && VALID_STATUSES.has(status)) {
      where.meetingStatus = status
    }

    // Get total count
    const total = await prisma.meeting.count({ where })

    const data = await prisma.meeting.findMany({
      where,
      select: meetingSelect,
      orderBy: { scheduledDate: "desc" },
      skip,
      take: limit,
    })

    return res.json({
      data: data.map(toMeetingApi),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// POST /api/meetings
export const createMeeting = async (req, res) => {
  try {
    const userId = req.user?.id
    const {
      studentId: reqStudentId = null,
      tutorId: reqTutorId = null,
      meetingType = "virtual",
      scheduledAt,
      durationMinutes = 30,
      location = null,
      meetingLink = null,
      notes = null,
    } = req.body

    if (!userId || !scheduledAt) {
      return res.status(400).json({ error: "scheduledAt is required" })
    }

    if (!VALID_TYPES.has(meetingType)) {
      return res.status(400).json({ error: "Invalid meetingType" })
    }

    const me = await getUserBasic(userId)
    if (!me || (me.role !== "student" && me.role !== "tutor")) {
      return res.status(403).json({ error: "Only students and tutors can create meetings" })
    }

    let studentId = reqStudentId
    let tutorId = reqTutorId

    if (me.role === "student") {
      studentId = me.id
      const assignment = await prisma.allocation.findUnique({
        where: { studentId: me.id },
        select: { tutorId: true },
      })
      if (!assignment) {
        return res.status(400).json({ error: "Student is not allocated to a tutor" })
      }
      tutorId = tutorId || assignment.tutorId
      if (tutorId !== assignment.tutorId) {
        return res.status(403).json({ error: "Student can schedule only with assigned tutor" })
      }
    }

    if (me.role === "tutor") {
      tutorId = me.id
      if (!studentId) {
        return res.status(400).json({ error: "studentId is required for tutor scheduling" })
      }
      const linked = await hasStudentTutorLink(studentId, me.id)
      if (!linked) {
        return res.status(403).json({ error: "Tutor can schedule only with assigned students" })
      }
    }

    const data = await prisma.meeting.create({
      data: {
        studentId,
        tutorId,
        meetingCreator: userId,
        meetingType,
        meetingStatus: "scheduled",
        scheduledDate: new Date(scheduledAt),
        durationMinutes,
        location,
        meetingLink,
        meetingName: notes || null,
      },
      select: meetingSelect,
    })

    // Notify the other party
    const scheduledDate = new Date(scheduledAt)
    const dateStr = scheduledDate.toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric" })
    const meetingTypeLabel = meetingType === "in_person" ? "In Person" : "Virtual"

    if (me.role === "tutor") {
      // Notify the student
      createNotification({
        userId: studentId,
        type: "meeting_scheduled",
        title: "New Meeting Scheduled",
        message: `${me.name || "Your tutor"} scheduled a meeting: ${notes || "Meeting"}.`,
        metadata: {
          meetingId: data.id,
          meetingName: notes || null,
          scheduledAt: data.scheduledDate,
          meetingType: meetingTypeLabel,
          location: location || null,
          meetingLink: meetingLink || null,
          meetingStatus: "scheduled",
        },
      })
    } else if (me.role === "student") {
      // Notify the tutor
      createNotification({
        userId: tutorId,
        type: "meeting_scheduled",
        title: "New Meeting Scheduled",
        message: `${me.name || "A student"} requested a meeting: ${notes || "Meeting"}.`,
        metadata: {
          meetingId: data.id,
          meetingName: notes || null,
          scheduledAt: data.scheduledDate,
          meetingType: meetingTypeLabel,
          location: location || null,
          meetingLink: meetingLink || null,
          meetingStatus: "scheduled",
        },
      })
    }

    return res.status(201).json({ data: toMeetingApi(data) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// PUT /api/meetings/:id - full update (tutor/student who can access the meeting)
export const updateMeeting = async (req, res) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    // Only read fields that are actually sent (no defaults), so status-only update keeps name/location
    const {
      notes,
      meetingType,
      scheduledAt,
      durationMinutes,
      location,
      meetingLink,
      meetingStatus,
    } = req.body

    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const existing = await prisma.meeting.findUnique({
      where: { id },
      select: { id: true, studentId: true, tutorId: true },
    })
    if (!existing) return res.status(404).json({ error: "Meeting not found" })
    if (existing.studentId !== userId && existing.tutorId !== userId) {
      return res.status(403).json({ error: "Not allowed" })
    }

    // Only update fields present in body (e.g. status-only update keeps name/location as record)
    const data = {}
    if (notes !== undefined) data.meetingName = notes || null
    if (meetingType !== undefined && VALID_TYPES.has(meetingType)) {
      data.meetingType = meetingType
      // Switching type: virtual → clear location; in_person → clear meeting link
      if (meetingType === "virtual") data.location = null
      else if (meetingType === "in_person") data.meetingLink = null
    }
    if (scheduledAt !== undefined) data.scheduledDate = new Date(scheduledAt)
    if (durationMinutes !== undefined) data.durationMinutes = durationMinutes
    if (location !== undefined) data.location = location || null
    if (meetingLink !== undefined) data.meetingLink = meetingLink || null
    if (meetingStatus !== undefined && VALID_STATUSES.has(meetingStatus)) data.meetingStatus = meetingStatus

    if (Object.keys(data).length === 0) {
      const current = await prisma.meeting.findUnique({ where: { id }, select: meetingSelect })
      return res.json({ data: toMeetingApi(current) })
    }

    const updated = await prisma.meeting.update({
      where: { id },
      data,
      select: meetingSelect,
    })

    // If status changed to completed/cancelled, notify the other party
    if (meetingStatus === "completed" || meetingStatus === "cancelled") {
      const me = await getUserBasic(userId)
      const isAccepted = meetingStatus === "completed"
      const notifType = isAccepted ? "meeting_accepted" : "meeting_rejected"
      const actionLabel = isAccepted ? "accepted" : "rejected"
      const meetingName = updated.meetingName || "Meeting"

      // Notify the party who did NOT make the change
      const otherPartyId = userId === existing.studentId ? existing.tutorId : existing.studentId
      createNotification({
        userId: otherPartyId,
        type: notifType,
        title: isAccepted ? "Meeting Accepted" : "Meeting Rejected",
        message: `${me?.name || "The other participant"} ${actionLabel} the meeting: ${meetingName}.`,
        metadata: {
          meetingId: id,
          meetingName,
          actionBy: me?.name || null,
          scheduledAt: updated.scheduledDate,
          meetingType: updated.meetingType === "in_person" ? "In Person" : "Virtual",
          location: updated.location || null,
        },
      })
    }

    return res.json({ data: toMeetingApi(updated) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// GET /api/admin/meetings (Admin only - optional)
export const listAllMeetings = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const me = await getUserBasic(userId)
    if (!me || me.role !== "admin") {
      return res.status(403).json({ error: "Admin only" })
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const total = await prisma.meeting.count()

    const data = await prisma.meeting.findMany({
      select: meetingSelect,
      orderBy: { scheduledDate: "desc" },
      skip,
      take: limit,
    })

    return res.json({
      data: data.map(toMeetingApi),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

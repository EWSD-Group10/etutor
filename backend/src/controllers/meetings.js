import { prisma } from "../utils/prisma.js"
import { getUserBasic, hasStudentTutorLink } from "../utils/relationship.js"

const meetingSelect = {
  id: true,
  meetingType: true,
  meetingStatus: true,
  scheduledAt: true,
  durationMinutes: true,
  location: true,
  meetingLink: true,
  notes: true,
  createdAt: true,
  student: { select: { id: true, name: true, email: true } },
  tutor: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true, role: true } },
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
      orderBy: { scheduledAt: "desc" },
      skip,
      take: limit,
    })

    return res.json({
      data,
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
        createdById: userId,
        meetingType,
        meetingStatus: "scheduled", // Default status
        scheduledAt: new Date(scheduledAt),
        durationMinutes,
        location,
        meetingLink,
        notes,
      },
      select: meetingSelect,
    })

    return res.status(201).json({ data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

// PATCH /api/meetings/:id/status
export const updateMeetingStatus = async (req, res) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    const { meetingStatus } = req.body

    if (!userId || !meetingStatus) {
      return res.status(400).json({ error: "meetingStatus is required" })
    }

    if (!VALID_STATUSES.has(meetingStatus)) {
      return res.status(400).json({ error: "Invalid meetingStatus" })
    }

    const existing = await prisma.meeting.findUnique({
      where: { id },
      select: { id: true, studentId: true, tutorId: true },
    })
    if (!existing) return res.status(404).json({ error: "Meeting not found" })

    // Both student and tutor can update status
    if (existing.studentId !== userId && existing.tutorId !== userId) {
      return res.status(403).json({ error: "Not allowed" })
    }

    const data = await prisma.meeting.update({
      where: { id },
      data: { meetingStatus },
      select: meetingSelect,
    })

    return res.json({ data })
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
      orderBy: { scheduledAt: "desc" },
      skip,
      take: limit,
    })

    return res.json({
      data,
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

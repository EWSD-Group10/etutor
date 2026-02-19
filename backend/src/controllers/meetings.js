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

export const listMeetings = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    const me = await getUserBasic(userId)
    if (!me) return res.status(404).json({ error: "User not found" })

    let where = {}
    if (me.role === "student") where = { studentId: userId }
    if (me.role === "tutor") where = { tutorId: userId }

    const data = await prisma.meeting.findMany({
      where,
      select: meetingSelect,
      orderBy: { scheduledAt: "desc" },
      take: 300,
    })
    return res.json({ data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const createMeeting = async (req, res) => {
  try {
    const userId = req.user?.id
    const {
      studentId: reqStudentId = null,
      tutorId: reqTutorId = null,
      meetingType = "virtual",
      meetingStatus = "scheduled",
      scheduledAt,
      durationMinutes = 30,
      location = null,
      meetingLink = null,
      notes = null,
    } = req.body
    if (!userId || !scheduledAt) {
      return res.status(400).json({ error: "scheduledAt is required" })
    }

    const me = await getUserBasic(userId)
    if (!me || (me.role !== "student" && me.role !== "tutor")) {
      return res.status(403).json({ error: "Only students and tutors can create meetings" })
    }

    let studentId = reqStudentId
    let tutorId = reqTutorId

    if (me.role === "student") {
      studentId = me.id
      const assignment = await prisma.tutorStudentAssignment.findUnique({
        where: { studentId: me.id },
        select: { tutorId: true },
      })
      if (!assignment) return res.status(400).json({ error: "Student is not allocated to a tutor" })
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
        meetingStatus,
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

export const updateMeetingStatus = async (req, res) => {
  try {
    const userId = req.user?.id
    const { id } = req.params
    const { meetingStatus } = req.body
    if (!userId || !meetingStatus) {
      return res.status(400).json({ error: "meetingStatus is required" })
    }

    const existing = await prisma.meeting.findUnique({
      where: { id },
      select: { id: true, studentId: true, tutorId: true },
    })
    if (!existing) return res.status(404).json({ error: "Meeting not found" })
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


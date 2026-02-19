import { prisma } from "../utils/prisma.js"
import { getUserBasic } from "../utils/relationship.js"

const daysAgo = (days) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

const lastDate = (arr) =>
  arr.length ? arr.map((x) => new Date(x)).sort((a, b) => b - a)[0] : null

export const tutorGroupStats = async (req, res) => {
  try {
    const tutorId = req.user?.id
    if (!tutorId) return res.status(401).json({ error: "Unauthorized" })

    const me = await getUserBasic(tutorId)
    if (!me || me.role !== "tutor") {
      return res.status(403).json({ error: "Tutor access required" })
    }

    const tutees = await prisma.tutorStudentAssignment.findMany({
      where: { tutorId },
      select: {
        studentId: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            degreeProgram: true,
          },
        },
      },
    })
    const studentIds = tutees.map((t) => t.studentId)

    const messagesByStudent = await Promise.all(
      studentIds.map(async (studentId) => {
        const count = await prisma.message.count({
          where: {
            OR: [
              { senderId: tutorId, recipientId: studentId },
              { senderId: studentId, recipientId: tutorId },
            ],
          },
        })
        return { studentId, count }
      }),
    )
    const messageMap = new Map(messagesByStudent.map((m) => [m.studentId, m.count]))
    const tuteesDetailed = tutees.map((t) => ({
      id: t.student.id,
      name: t.student.name,
      email: t.student.email,
      department: t.student.department,
      degreeProgram: t.student.degreeProgram,
      messageCount: messageMap.get(t.student.id) || 0,
    }))

    const avgMessagesPerTutee = studentIds.length
      ? Number(
          (
            messagesByStudent.reduce((sum, s) => sum + s.count, 0) / studentIds.length
          ).toFixed(2),
        )
      : 0

    return res.json({
      data: {
        tutor: me,
        tuteeCount: studentIds.length,
        avgMessagesPerTutee,
        messagesByStudent,
        tutees: tuteesDetailed,
      },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const adminSummary = async (req, res) => {
  try {
    const me = await getUserBasic(req.user?.id)
    if (!me || me.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }

    const last7 = daysAgo(7)
    const last28 = daysAgo(28)

    const [messagesLast7Days, tutors, assignments, students] = await Promise.all([
      prisma.message.count({ where: { createdAt: { gte: last7 } } }),
      prisma.user.findMany({ where: { role: "tutor", isActive: true }, select: { id: true, name: true, email: true } }),
      prisma.tutorStudentAssignment.findMany({ select: { studentId: true, tutorId: true } }),
      prisma.user.findMany({ where: { role: "student", isActive: true }, select: { id: true, name: true, email: true } }),
    ])

    const tutorMessageCounts = await Promise.all(
      tutors.map(async (tutor) => {
        const count = await prisma.message.count({
          where: {
            OR: [{ senderId: tutor.id }, { recipientId: tutor.id }],
          },
        })
        return { tutorId: tutor.id, tutorName: tutor.name, count }
      }),
    )
    const avgMessagesPerTutor = tutors.length
      ? Number(
          (
            tutorMessageCounts.reduce((sum, t) => sum + t.count, 0) / tutors.length
          ).toFixed(2),
        )
      : 0

    const assignedSet = new Set(assignments.map((a) => a.studentId))
    const unallocatedStudents = students.filter((s) => !assignedSet.has(s.id))

    const interactionMatrix = await Promise.all(
      students.map(async (student) => {
        const [messages, blogPosts, blogComments, documents, docComments, meetings] =
          await Promise.all([
            prisma.message.findMany({
              where: {
                OR: [{ senderId: student.id }, { recipientId: student.id }],
              },
              select: { createdAt: true },
              take: 300,
            }),
            prisma.blogPost.findMany({ where: { authorId: student.id }, select: { createdAt: true }, take: 200 }),
            prisma.blogComment.findMany({ where: { authorId: student.id }, select: { createdAt: true }, take: 300 }),
            prisma.document.findMany({ where: { uploaderId: student.id }, select: { createdAt: true }, take: 200 }),
            prisma.documentComment.findMany({ where: { authorId: student.id }, select: { createdAt: true }, take: 300 }),
            prisma.meeting.findMany({ where: { studentId: student.id }, select: { createdAt: true, scheduledAt: true }, take: 200 }),
          ])

        const latest = lastDate([
          ...messages.map((x) => x.createdAt),
          ...blogPosts.map((x) => x.createdAt),
          ...blogComments.map((x) => x.createdAt),
          ...documents.map((x) => x.createdAt),
          ...docComments.map((x) => x.createdAt),
          ...meetings.map((x) => x.createdAt),
          ...meetings.map((x) => x.scheduledAt),
        ])

        return { student, latestInteractionAt: latest }
      }),
    )

    const atRisk7Days = interactionMatrix.filter(
      (x) => !x.latestInteractionAt || x.latestInteractionAt < last7,
    )
    const atRisk28Days = interactionMatrix.filter(
      (x) => !x.latestInteractionAt || x.latestInteractionAt < last28,
    )

    return res.json({
      data: {
        systemStats: {
          messagesLast7Days,
          avgMessagesPerTutor,
        },
        exceptionReports: {
          unallocatedStudents,
          atRiskLowEngagement7Days: atRisk7Days.map((x) => x.student),
          atRiskHighPriority28Days: atRisk28Days.map((x) => x.student),
        },
        tutorMessageCounts,
      },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const studentEngagementSummary = async (req, res) => {
  try {
    const studentId = req.user?.id
    const me = await getUserBasic(studentId)
    if (!me || me.role !== "student") {
      return res.status(403).json({ error: "Student access required" })
    }

    const assignment = await prisma.tutorStudentAssignment.findUnique({
      where: { studentId },
      select: { tutorId: true, tutor: { select: { id: true, name: true, email: true } } },
    })
    if (!assignment) {
      return res.json({
        data: {
          tutor: null,
          messageCountWithTutor: 0,
          meetingsCount: 0,
          blogPostsCount: 0,
          documentUploadsCount: 0,
        },
      })
    }

    const [messageCountWithTutor, meetingsCount, blogPostsCount, documentUploadsCount] =
      await Promise.all([
        prisma.message.count({
          where: {
            OR: [
              { senderId: studentId, recipientId: assignment.tutorId },
              { senderId: assignment.tutorId, recipientId: studentId },
            ],
          },
        }),
        prisma.meeting.count({ where: { studentId } }),
        prisma.blogPost.count({ where: { authorId: studentId } }),
        prisma.document.count({ where: { uploaderId: studentId } }),
      ])

    return res.json({
      data: {
        tutor: assignment.tutor,
        messageCountWithTutor,
        meetingsCount,
        blogPostsCount,
        documentUploadsCount,
      },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

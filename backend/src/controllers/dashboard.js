import { prisma } from "../utils/prisma.js"

export const studentDashboard = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const student = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        degreeProgram: true,
        department: true,
        studentAssignment: {
          include: {
            tutor: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    if (!student) return res.status(404).json({ error: "User not found" })

    let engagementSummary = {
      messageCountWithTutor: 0,
      meetingsCount: 0,
      blogPostsCount: 0,
      documentUploadsCount: 0,
    }

    if (student.studentAssignment?.tutor?.id) {
      const tutorId = student.studentAssignment.tutor.id
      try {
        const [messageCountWithTutor, meetingsCount, blogPostsCount, documentUploadsCount] =
          await Promise.all([
            prisma.message.count({
              where: {
                OR: [
                  { senderId: userId, recipientId: tutorId },
                  { senderId: tutorId, recipientId: userId },
                ],
              },
            }),
            prisma.meeting.count({ where: { studentId: userId } }),
            prisma.blogPost.count({ where: { authorId: userId } }),
            prisma.document.count({ where: { uploaderId: userId } }),
          ])
        engagementSummary = {
          messageCountWithTutor,
          meetingsCount,
          blogPostsCount,
          documentUploadsCount,
        }
      } catch (summaryError) {
        // Keep dashboard available even before optional modules are migrated.
        console.warn("Student engagement summary fallback:", summaryError.message)
      }
    }

    res.json({
      ok: true,
      student,
      tutor: student.studentAssignment?.tutor || null,
      engagementSummary,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

export const tutorDashboard = async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    const sortBy = req.query.sortBy || "assignedAt"
    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc"
    const filter = req.query.filter?.trim()?.toLowerCase() || ""

    const tutor = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tutorAssignments: {
          include: {
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
          orderBy:
            sortBy === "name"
              ? { student: { name: sortOrder } }
              : sortBy === "email"
                ? { student: { email: sortOrder } }
                : { assignedAt: sortOrder },
        },
      },
    })

    if (!tutor) return res.status(404).json({ error: "User not found" })

    let students = tutor.tutorAssignments.map((a) => ({
      ...a.student,
      assignedAt: a.assignedAt,
    }))

    if (filter) {
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(filter) ||
          s.email.toLowerCase().includes(filter),
      )
    }

    let messageCounts = []
    try {
      messageCounts = await Promise.all(
        students.map(async (student) => {
          const count = await prisma.message.count({
            where: {
              OR: [
                { senderId: userId, recipientId: student.id },
                { senderId: student.id, recipientId: userId },
              ],
            },
          })
          return { studentId: student.id, count }
        }),
      )
    } catch (summaryError) {
      // Keep dashboard available even before optional modules are migrated.
      console.warn("Tutor dashboard message summary fallback:", summaryError.message)
    }

    res.json({
      ok: true,
      tutor: {
        id: tutor.id,
        email: tutor.email,
        name: tutor.name,
        role: tutor.role,
      },
      students,
      stats: {
        totalTutees: students.length,
        avgMessagesPerTutee: students.length
          ? Number(
              (
                messageCounts.reduce((sum, m) => sum + m.count, 0) /
                students.length
              ).toFixed(2),
            )
          : 0,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

import { prisma } from "../utils/prisma.js"
import { hashPassword } from "../utils/auth.js"
import { sendEmail } from "../utils/mailer.js"
import { buildStudentMetrics } from "../utils/uiData.js"

const normalizeIds = (ids) => {
  if (!Array.isArray(ids)) return []
  return [...new Set(ids.filter(Boolean))]
}

export const createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      role,
      degreeProgram = null,
      department = null,
      yearLevel = null,
      maxStudents = null,
    } = req.body

    if (!email || !password || !name || !role) {
      return res.status(400).json({
        error: "email, password, name, role are required",
      })
    }

    const normalizedRole = String(role).toLowerCase()
    if (normalizedRole !== "student" && normalizedRole !== "tutor") {
      return res
        .status(400)
        .json({ error: "role must be student or tutor" })
    }

    if (normalizedRole === "student" && yearLevel !== null && yearLevel !== undefined) {
      const year = Number(yearLevel)
      if (!Number.isInteger(year) || year < 1 || year > 8) {
        return res.status(400).json({ error: "yearLevel must be an integer between 1 and 8" })
      }
    }
    if (normalizedRole === "tutor" && maxStudents !== null && maxStudents !== undefined) {
      const cap = Number(maxStudents)
      if (!Number.isInteger(cap) || cap < 1 || cap > 200) {
        return res.status(400).json({ error: "maxStudents must be an integer between 1 and 200" })
      }
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email: String(email).trim().toLowerCase(),
        passwordHash,
        name: String(name).trim(),
        role: normalizedRole,
        degreeProgram: degreeProgram ? String(degreeProgram).trim() : null,
        department: department ? String(department).trim() : null,
        yearLevel:
          normalizedRole === "student" && yearLevel !== null && yearLevel !== undefined
            ? Number(yearLevel)
            : null,
        maxStudents:
          normalizedRole === "tutor" && maxStudents !== null && maxStudents !== undefined
            ? Number(maxStudents)
            : normalizedRole === "tutor"
              ? 15
              : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        yearLevel: true,
        maxStudents: true,
        createdAt: true,
      },
    })

    return res.status(201).json({ ok: true, user })
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "email already exists" })
    }
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

export const adminDashboard = async (req, res) => {
  try {
    const [users, assignments] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          degreeProgram: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.tutorStudentAssignment.findMany({
        include: {
          tutor: { select: { id: true, name: true, email: true } },
          student: { select: { id: true, name: true, email: true, degreeProgram: true } },
        },
        orderBy: { assignedAt: "desc" },
      }),
    ])

    const students = users.filter((u) => u.role === "student")
    const tutors = users.filter((u) => u.role === "tutor")
    const atRiskStudents = students.filter((student) => {
      const metrics = buildStudentMetrics(student)
      return metrics.riskLevel !== "on_track"
    })
    const engagementAvg = students.length
      ? Math.round(
          students.reduce((sum, student) => sum + buildStudentMetrics(student).engagement, 0) /
            students.length,
        )
      : 0

    const degreeBuckets = students.reduce((acc, student) => {
      const key = student.degreeProgram || "General"
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const chartTrend = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"].map(
      (label, idx) => {
        const value = Math.max(
          35,
          Math.min(90, engagementAvg + (idx - 2) * 3 + ((idx * 7) % 6)),
        )
        return { label, value }
      },
    )

    const distribution = Object.entries(degreeBuckets)
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }))

    res.json({
      ok: true,
      users,
      assignments,
      stats: {
        totalStudents: students.length,
        activeTutors: tutors.filter((t) => t.isActive).length,
        atRiskStudents: atRiskStudents.length,
        avgEngagement: engagementAvg,
      },
      chartTrend,
      distribution,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

export const assignmentOptions = async (req, res) => {
  try {
    const tutors = await prisma.user.findMany({
      where: { role: "tutor" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    })

    const students = await prisma.user.findMany({
      where: { role: "student" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    })

    res.json({ ok: true, tutors, students })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

export const assignStudentsToTutor = async (req, res) => {
  try {
    const { tutorId, studentIds } = req.body

    if (!tutorId || !Array.isArray(studentIds)) {
      return res.status(400).json({
        error: "tutorId and studentIds[] are required",
      })
    }

    const uniqueStudentIds = normalizeIds(studentIds)
    if (uniqueStudentIds.length < 10) {
      return res
        .status(400)
        .json({ error: "Minimum 10 students required per assignment" })
    }

    const tutor = await prisma.user.findUnique({
      where: { id: tutorId },
      select: { id: true, name: true, email: true, role: true },
    })
    if (!tutor || tutor.role !== "tutor") {
      return res.status(404).json({ error: "Tutor not found" })
    }

    const students = await prisma.user.findMany({
      where: { id: { in: uniqueStudentIds }, role: "student" },
      select: { id: true, name: true, email: true },
    })

    if (students.length !== uniqueStudentIds.length) {
      const foundIds = new Set(students.map((s) => s.id))
      const missing = uniqueStudentIds.filter((id) => !foundIds.has(id))
      return res.status(400).json({
        error: "Some students not found or not students",
        missingIds: missing,
      })
    }

    const previousAssignments = await prisma.tutorStudentAssignment.findMany({
      where: { studentId: { in: uniqueStudentIds } },
      select: {
        studentId: true,
        tutorId: true,
        tutor: { select: { id: true, name: true, email: true } },
      },
    })

    await prisma.$transaction(
      uniqueStudentIds.map((studentId) =>
        prisma.tutorStudentAssignment.upsert({
          where: { studentId },
          update: { tutorId: tutor.id },
          create: { tutorId: tutor.id, studentId },
        }),
      ),
    )

    const studentMap = new Map(students.map((s) => [s.id, s]))

    const emailJobs = []

    for (const studentId of uniqueStudentIds) {
      const student = studentMap.get(studentId)
      if (!student || !student.email) continue
      const previous = previousAssignments.find(
        (assignment) => assignment.studentId === studentId,
      )

      const subject = "Tutor assignment update"
      const body = `
        <h2>Assignment Update</h2>
        <p>Hello ${student.name},</p>
        <p>You have been assigned to tutor <strong>${tutor.name}</strong>.</p>
        ${
          previous && previous.tutorId !== tutor.id
            ? `<p>Your previous tutor was <strong>${previous.tutor.name}</strong>.</p>`
            : ""
        }
      `
      emailJobs.push(sendEmail(student.email, subject, body))
    }

    if (tutor.email) {
      const subject = "New students assigned"
      const body = `
        <h2>New Student Assignments</h2>
        <p>Hello ${tutor.name},</p>
        <p>${uniqueStudentIds.length} students have been assigned to you.</p>
      `
      emailJobs.push(sendEmail(tutor.email, subject, body))
    }

    await Promise.allSettled(emailJobs)

    res.json({
      ok: true,
      tutorId: tutor.id,
      assignedStudentCount: uniqueStudentIds.length,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

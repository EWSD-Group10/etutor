import { prisma } from "../utils/prisma.js"
import { buildStudentMetrics, buildTutorMetrics, initials } from "../utils/uiData.js"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const assignmentSelect = {
  id: true,
  assignedAt: true,
  tutor: {
    select: { id: true, name: true, email: true, department: true },
  },
  student: {
    select: { id: true, name: true, email: true, degreeProgram: true },
  },
}

const formatAllocation = (row, tutorAssignedCount = 0) => {
  const studentMetrics = buildStudentMetrics(row.student)
  const tutorMetrics = buildTutorMetrics(row.tutor, tutorAssignedCount)
  return {
    ...row,
    reason: row.reason || "Initial assignment",
    notes: row.notes || "",
    student: {
      ...row.student,
      initials: initials(row.student.name),
      ...studentMetrics,
    },
    tutor: {
      ...row.tutor,
      initials: initials(row.tutor.name),
      assignedStudents: tutorAssignedCount,
      ...tutorMetrics,
    },
  }
}

const validateUUID = (value, label) => {
  if (!value) return `${label} is required`
  if (!UUID_REGEX.test(value)) return `Invalid ${label} format`
  return null
}

export const listAllocations = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10))
    const search = req.query.search?.trim() || ""

    const where = search
      ? {
          OR: [
            { student: { name: { contains: search, mode: "insensitive" } } },
            { student: { email: { contains: search, mode: "insensitive" } } },
            { tutor: { name: { contains: search, mode: "insensitive" } } },
            { tutor: { email: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}

    const [data, total, rawAssignments] = await Promise.all([
      prisma.tutorStudentAssignment.findMany({
        where,
        select: assignmentSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { assignedAt: "desc" },
      }),
      prisma.tutorStudentAssignment.count({ where }),
      prisma.tutorStudentAssignment.findMany({ select: { tutorId: true } }),
    ])

    const countByTutor = rawAssignments.reduce((acc, row) => {
      acc[row.tutorId] = (acc[row.tutorId] || 0) + 1
      return acc
    }, {})

    return res.json({
      data: data.map((row) => formatAllocation(row, countByTutor[row.tutor.id] || 0)),
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

export const getAllocation = async (req, res) => {
  try {
    const { id } = req.params
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid allocation ID format" })
    }

    const data = await prisma.tutorStudentAssignment.findUnique({
      where: { id },
      select: assignmentSelect,
    })

    if (!data) {
      return res.status(404).json({ error: "Allocation not found" })
    }

    const tutorAssignedCount = await prisma.tutorStudentAssignment.count({
      where: { tutorId: data.tutor.id },
    })
    return res.json({ data: formatAllocation(data, tutorAssignedCount) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const createAllocation = async (req, res) => {
  try {
    const { tutorId, studentId } = req.body
    const errors = []

    const tutorError = validateUUID(tutorId, "tutorId")
    if (tutorError) errors.push(tutorError)
    const studentError = validateUUID(studentId, "studentId")
    if (studentError) errors.push(studentError)

    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    const tutor = await prisma.user.findFirst({
      where: { id: tutorId, role: "tutor" },
      select: { id: true },
    })
    if (!tutor) return res.status(404).json({ error: "Tutor not found" })

    const student = await prisma.user.findFirst({
      where: { id: studentId, role: "student" },
      select: { id: true },
    })
    if (!student) return res.status(404).json({ error: "Student not found" })

    const data = await prisma.tutorStudentAssignment.upsert({
      where: { studentId },
      create: { tutorId, studentId },
      update: { tutorId, assignedAt: new Date() },
      select: assignmentSelect,
    })

    const tutorAssignedCount = await prisma.tutorStudentAssignment.count({
      where: { tutorId: data.tutor.id },
    })
    return res.status(201).json({ data: formatAllocation(data, tutorAssignedCount) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const bulkCreateAllocations = async (req, res) => {
  try {
    const { tutorId, studentIds } = req.body
    const errors = []

    const tutorError = validateUUID(tutorId, "tutorId")
    if (tutorError) errors.push(tutorError)

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      errors.push("studentIds must be a non-empty array")
    } else {
      studentIds.forEach((id, i) => {
        if (!UUID_REGEX.test(id)) {
          errors.push(`studentIds[${i}]: invalid UUID format`)
        }
      })
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    const tutor = await prisma.user.findFirst({
      where: { id: tutorId, role: "tutor" },
      select: { id: true },
    })
    if (!tutor) return res.status(404).json({ error: "Tutor not found" })

    const students = await prisma.user.findMany({
      where: { id: { in: studentIds }, role: "student" },
      select: { id: true },
    })
    const foundSet = new Set(students.map((s) => s.id))
    const invalidStudentIds = studentIds.filter((id) => !foundSet.has(id))
    if (invalidStudentIds.length > 0) {
      return res.status(404).json({
        error: "Some students not found",
        invalidStudentIds,
      })
    }

    const uniqueIds = [...new Set(studentIds)]
    const data = await prisma.$transaction(
      uniqueIds.map((studentId) =>
        prisma.tutorStudentAssignment.upsert({
          where: { studentId },
          create: { tutorId, studentId },
          update: { tutorId, assignedAt: new Date() },
          select: assignmentSelect,
        }),
      ),
    )

    const tutorAssignedCount = await prisma.tutorStudentAssignment.count({
      where: { tutorId },
    })

    return res.status(201).json({
      data: data.map((row) => formatAllocation(row, tutorAssignedCount)),
      summary: { total: data.length },
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const updateAllocation = async (req, res) => {
  try {
    const { id } = req.params
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid allocation ID format" })
    }

    const { tutorId } = req.body
    if (!tutorId || !UUID_REGEX.test(tutorId)) {
      return res.status(400).json({ error: "Valid tutorId is required" })
    }

    const existing = await prisma.tutorStudentAssignment.findUnique({
      where: { id },
      select: { id: true, tutorId: true },
    })
    if (!existing) {
      return res.status(404).json({ error: "Allocation not found" })
    }

    const tutor = await prisma.user.findFirst({
      where: { id: tutorId, role: "tutor" },
      select: { id: true },
    })
    if (!tutor) return res.status(404).json({ error: "Tutor not found" })

    const data = await prisma.tutorStudentAssignment.update({
      where: { id },
      data: { tutorId, assignedAt: new Date() },
      select: assignmentSelect,
    })

    const tutorAssignedCount = await prisma.tutorStudentAssignment.count({
      where: { tutorId: data.tutor.id },
    })
    return res.json({ data: formatAllocation(data, tutorAssignedCount) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const listUnassignedStudents = async (req, res) => {
  try {
    const search = req.query.search?.trim() || ""

    const students = await prisma.user.findMany({
      where: {
        role: "student",
        studentAssignment: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { degreeProgram: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        degreeProgram: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return res.json({
      data: students.map((student) => ({
        ...student,
        initials: initials(student.name),
        ...buildStudentMetrics(student),
      })),
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid allocation ID format" })
    }

    const existing = await prisma.tutorStudentAssignment.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!existing) {
      return res.status(404).json({ error: "Allocation not found" })
    }

    await prisma.tutorStudentAssignment.delete({ where: { id } })
    return res.json({ message: "Allocation removed successfully" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

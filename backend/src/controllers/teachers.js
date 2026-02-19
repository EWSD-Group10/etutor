import { prisma } from "../utils/prisma.js"
import { hashPassword } from "../utils/auth.js"
import { buildTutorMetrics, initials } from "../utils/uiData.js"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const tutorSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  degreeProgram: true,
  department: true,
  maxStudents: true,
  isActive: true,
  createdAt: true,
}

const withMetrics = (tutor, assignedCount = 0) => {
  const metrics = buildTutorMetrics(tutor, assignedCount)
  return {
    ...tutor,
    initials: initials(tutor.name),
    assignedStudents: assignedCount,
    ...metrics,
  }
}

export const listTutors = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10))
    const search = req.query.search?.trim() || ""

    const where = {
      role: "tutor",
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    }

    const [data, total, assignments] = await Promise.all([
      prisma.user.findMany({
        where,
        select: tutorSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
      prisma.tutorStudentAssignment.findMany({ select: { tutorId: true } }),
    ])

    const countByTutor = assignments.reduce((acc, row) => {
      acc[row.tutorId] = (acc[row.tutorId] || 0) + 1
      return acc
    }, {})

    return res.json({
      data: data.map((tutor) => withMetrics(tutor, countByTutor[tutor.id] || 0)),
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

export const getTutor = async (req, res) => {
  try {
    const { id } = req.params
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid tutor ID format" })
    }

    const [tutor, assignedCount] = await Promise.all([
      prisma.user.findFirst({
      where: { id, role: "tutor" },
      select: tutorSelect,
      }),
      prisma.tutorStudentAssignment.count({ where: { tutorId: id } }),
    ])
    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found" })
    }

    return res.json({ data: withMetrics(tutor, assignedCount) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const createTutor = async (req, res) => {
  try {
    const {
      email,
      name,
      degreeProgram,
      department,
      maxStudents = null,
      password,
    } = req.body
    const errors = []

    if (!email) errors.push("Email is required")
    else if (!EMAIL_REGEX.test(email)) errors.push("Invalid email format")
    if (!name) errors.push("Name is required")
    if (!department) errors.push("Department is required")
    if (!password || String(password).trim().length < 6) {
      errors.push("Password is required and must be at least 6 characters")
    }
    if (maxStudents !== null && maxStudents !== undefined) {
      const cap = Number(maxStudents)
      if (!Number.isInteger(cap) || cap < 1 || cap > 200) {
        errors.push("maxStudents must be an integer between 1 and 200")
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })
    if (existing) {
      return res.status(409).json({ error: "Email already exists" })
    }

    const tutor = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: await hashPassword(String(password).trim()),
        name: String(name).trim(),
        role: "tutor",
        degreeProgram: degreeProgram ? String(degreeProgram).trim() : null,
        department: String(department).trim(),
        maxStudents:
          maxStudents !== null && maxStudents !== undefined
            ? Number(maxStudents)
            : 15,
      },
      select: tutorSelect,
    })

    return res.status(201).json({ data: withMetrics(tutor, 0) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const updateTutor = async (req, res) => {
  try {
    const { id } = req.params
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid tutor ID format" })
    }

    const { email, name, degreeProgram, department, maxStudents, password } = req.body
    const errors = []
    const data = {}

    if (email !== undefined) {
      if (!EMAIL_REGEX.test(email)) errors.push("Invalid email format")
      else data.email = String(email).trim().toLowerCase()
    }
    if (name !== undefined) data.name = String(name).trim()
    if (degreeProgram !== undefined) {
      data.degreeProgram = degreeProgram ? String(degreeProgram).trim() : null
    }
    if (department !== undefined) {
      data.department = department ? String(department).trim() : null
    }
    if (maxStudents !== undefined) {
      const cap = Number(maxStudents)
      if (!Number.isInteger(cap) || cap < 1 || cap > 200) {
        errors.push("maxStudents must be an integer between 1 and 200")
      } else {
        data.maxStudents = cap
      }
    }
    if (password !== undefined) {
      if (!String(password).trim() || String(password).trim().length < 6) {
        errors.push("password must be at least 6 characters")
      } else {
        data.passwordHash = await hashPassword(String(password).trim())
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }
    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ error: "At least one field is required to update" })
    }

    const existing = await prisma.user.findFirst({
      where: { id, role: "tutor" },
    })
    if (!existing) {
      return res.status(404).json({ error: "Tutor not found" })
    }

    if (data.email && data.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: data.email },
      })
      if (emailTaken) {
        return res.status(409).json({ error: "Email already exists" })
      }
    }

    const tutor = await prisma.user.update({
      where: { id },
      data,
      select: tutorSelect,
    })

    const assignedCount = await prisma.tutorStudentAssignment.count({
      where: { tutorId: tutor.id },
    })
    return res.json({ data: withMetrics(tutor, assignedCount) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteTutor = async (req, res) => {
  try {
    const { id } = req.params
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid tutor ID format" })
    }

    const existing = await prisma.user.findFirst({
      where: { id, role: "tutor" },
    })
    if (!existing) {
      return res.status(404).json({ error: "Tutor not found" })
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })

    return res.json({ message: "Tutor deactivated successfully" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

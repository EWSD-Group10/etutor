import { prisma } from "../utils/prisma.js"
import { hashPassword } from "../utils/auth.js"
import { buildStudentMetrics, initials } from "../utils/uiData.js"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const studentSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  degreeProgram: true,
  department: true,
  yearLevel: true,
  isActive: true,
  createdAt: true,
}

const withMetrics = (student) => {
  const metrics = buildStudentMetrics(student)
  return {
    ...student,
    initials: initials(student.name),
    ...metrics,
  }
}

export const listStudents = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10))
    const search = req.query.search?.trim() || ""

    const where = {
      role: "student",
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: studentSelect,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ])

    return res.json({
      data: data.map(withMetrics),
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

export const getStudent = async (req, res) => {
  try {
    const { id } = req.params
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid student ID format" })
    }

    const student = await prisma.user.findFirst({
      where: { id, role: "student" },
      select: studentSelect,
    })

    if (!student) {
      return res.status(404).json({ error: "Student not found" })
    }

    return res.json({ data: withMetrics(student) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const createStudent = async (req, res) => {
  try {
    const { email, name, degreeProgram, department = null, yearLevel = null, password } = req.body
    const errors = []

    if (!email) errors.push("Email is required")
    else if (!EMAIL_REGEX.test(email)) errors.push("Invalid email format")
    if (!name) errors.push("Name is required")
    if (!password || String(password).trim().length < 6) {
      errors.push("Password is required and must be at least 6 characters")
    }
    if (yearLevel !== null && yearLevel !== undefined) {
      const year = Number(yearLevel)
      if (!Number.isInteger(year) || year < 1 || year > 8) {
        errors.push("yearLevel must be an integer between 1 and 8")
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

    const student = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: await hashPassword(String(password).trim()),
        name: String(name).trim(),
        role: "student",
        degreeProgram: degreeProgram ? String(degreeProgram).trim() : null,
        department: department ? String(department).trim() : null,
        yearLevel: yearLevel !== null && yearLevel !== undefined ? Number(yearLevel) : null,
      },
      select: studentSelect,
    })

    return res.status(201).json({ data: withMetrics(student) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid student ID format" })
    }

    const { email, name, degreeProgram, department, yearLevel, password } = req.body
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
    if (yearLevel !== undefined) {
      const year = Number(yearLevel)
      if (!Number.isInteger(year) || year < 1 || year > 8) {
        errors.push("yearLevel must be an integer between 1 and 8")
      } else {
        data.yearLevel = year
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
      where: { id, role: "student" },
    })
    if (!existing) {
      return res.status(404).json({ error: "Student not found" })
    }

    if (data.email && data.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: data.email },
      })
      if (emailTaken) {
        return res.status(409).json({ error: "Email already exists" })
      }
    }

    const student = await prisma.user.update({
      where: { id },
      data,
      select: studentSelect,
    })

    return res.json({ data: withMetrics(student) })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid student ID format" })
    }

    const existing = await prisma.user.findFirst({
      where: { id, role: "student" },
    })
    if (!existing) {
      return res.status(404).json({ error: "Student not found" })
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })

    return res.json({ message: "Student deactivated successfully" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
}

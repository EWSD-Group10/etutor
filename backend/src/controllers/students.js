import { prisma } from "../utils/prisma.js"
import { hashPassword } from "../utils/auth.js"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const studentSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  degreeProgram: true,
  isActive: true,
  createdAt: true,
}

// GET /api/students?page=1&limit=10&search=
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

    res.json({
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
    res.status(500).json({ error: "Internal server error" })
  }
}

// GET /api/students/:id
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

    res.json({ data: student })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
}

// POST /api/students
export const createStudent = async (req, res) => {
  try {
    const { email, password, name, degreeProgram } = req.body
    const errors = []

    if (!email) errors.push("Email is required")
    else if (!EMAIL_REGEX.test(email)) errors.push("Invalid email format")

    if (!password) errors.push("Password is required")
    else if (password.length < 6) errors.push("Password must be at least 6 characters")

    if (!name) errors.push("Name is required")

    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: "Email already exists" })
    }

    const student = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        name,
        role: "student",
        degreeProgram: degreeProgram || null,
      },
      select: studentSelect,
    })

    res.status(201).json({ data: student })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
}

// PUT /api/students/:id
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid student ID format" })
    }

    const { email, password, name, degreeProgram, isActive } = req.body
    const errors = []
    const data = {}

    if (email !== undefined) {
      if (!EMAIL_REGEX.test(email)) errors.push("Invalid email format")
      else data.email = email
    }
    if (password !== undefined) {
      if (password.length < 6) errors.push("Password must be at least 6 characters")
      else data.passwordHash = await hashPassword(password)
    }
    if (name !== undefined) data.name = name
    if (degreeProgram !== undefined) data.degreeProgram = degreeProgram
    if (isActive !== undefined) data.isActive = isActive

    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "At least one field is required to update" })
    }

    // Check student exists
    const existing = await prisma.user.findFirst({ where: { id, role: "student" } })
    if (!existing) {
      return res.status(404).json({ error: "Student not found" })
    }

    // Check email uniqueness if changing email
    if (data.email && data.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: data.email } })
      if (emailTaken) {
        return res.status(409).json({ error: "Email already exists" })
      }
    }

    const student = await prisma.user.update({
      where: { id },
      data,
      select: studentSelect,
    })

    res.json({ data: student })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
}

// DELETE /api/students/:id (soft delete)
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: "Invalid student ID format" })
    }

    const existing = await prisma.user.findFirst({ where: { id, role: "student" } })
    if (!existing) {
      return res.status(404).json({ error: "Student not found" })
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })

    res.json({ message: "Student deactivated successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Internal server error" })
  }
}

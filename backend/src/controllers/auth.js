import { hashPassword, comparePassword } from "../utils/auth.js"
import jwt from "jsonwebtoken"
import { prisma } from "../utils/prisma.js"

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }
    const normalizedEmail = String(email).trim().toLowerCase()
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Compare password
    const isMatch = await comparePassword(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
      { expiresIn: "1d" },
    )
    res.cookie("token", token, {
      httpOnly: true, //secure: true
    })
    res.json({ message: "Login successful" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

export const currentUser = async (req, res) => {
  try {
    // Get userId from the authenticated request (set by requireSignin middleware)
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        degreeProgram: true,
        department: true,
        isActive: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    return res.json({ ok: true, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
    })
    return res.json({ ok: true, message: "Logged out" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

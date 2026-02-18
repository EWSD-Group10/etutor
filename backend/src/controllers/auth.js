import { hashPassword, comparePassword } from "../utils/auth.js"
import jwt from "jsonwebtoken"
import { pool } from "../utils/db.js"

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }
    // Fetch user from database
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    )
    const user = userResult.rows[0]

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
      { expiresIn: "14d" },
    )
    res.cookie("token", token, {
      httpOnly: true, //secure: true
    })
    res.json({ message: "Login successful", token })
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

    const userResult = await pool.query(
      "SELECT id, email, name, role, degree_program, department, is_active, created_at FROM users WHERE id = $1",
      [userId],
    )

    const user = userResult.rows[0]

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    return res.json({ ok: true, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}

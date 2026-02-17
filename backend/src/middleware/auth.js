import jwt from "jsonwebtoken"
import { pool } from "../utils/db.js"

export const requireSignin = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
    )
    req.user = { id: decoded.userId, role: decoded.role }
    next()
  } catch (err) {
    console.error(err)
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

export const isTutor = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT role FROM users WHERE id = $1", [
      req.user.id,
    ])
    const user = result.rows[0]
    if (!user || user.role !== "tutor") {
      return res.sendStatus(403)
    } else {
      next()
    }
  } catch (err) {
    console.log(err)
  }
}

export const isAdmin = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT role FROM users WHERE id = $1", [
      req.user.id,
    ])
    const user = result.rows[0]
    if (!user || user.role !== "admin") {
      return res.sendStatus(403)
    } else {
      next()
    }
  } catch (err) {
    console.log(err)
  }
}

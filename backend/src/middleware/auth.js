import jwt from "jsonwebtoken"
import { prisma } from "../utils/prisma.js"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export const requireSignin = (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = { id: decoded.sub, role: decoded.role.toLowerCase() }
    next()
  } catch (err) {
    console.error(err)
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

export const isTutor = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    })
    if (!user || user.role !== "tutor") {
      return res.sendStatus(403)
    }
    next()
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
}

export const isAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    })
    if (!user || user.role !== "admin") {
      return res.sendStatus(403)
    }
    next()
  } catch (err) {
    console.log(err)
    return res.sendStatus(500)
  }
}

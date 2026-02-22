import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export const hashPassword = async (password) => {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash)
}

export const generateAccessToken = (user) => {
  return jwt.sign(
    { sub: user.id, role: user.role.toUpperCase() },
    JWT_SECRET,
    { expiresIn: "15m" }
  )
}

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { sub: user.id, role: user.role.toUpperCase() },
    JWT_SECRET,
    { expiresIn: "7d" }
  )
}

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}

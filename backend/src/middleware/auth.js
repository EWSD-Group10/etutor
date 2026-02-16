import jwt from "jsonwebtoken"

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
    req.auth = { _id: decoded.userId }
    req.user = { id: decoded.userId, role: decoded.role }
    next()
  } catch (err) {
    console.error(err)
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

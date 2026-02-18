import dotenv from "dotenv"
import express from "express"
import cookieParser from "cookie-parser"
import { pool } from "./utils/db.js"
import { sendEmail } from "./utils/mailer.js"
import { login, currentUser } from "./controllers/auth.js"
import { listStudents, getStudent, createStudent, updateStudent, deleteStudent } from "./controllers/students.js"
import { listTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher } from "./controllers/teachers.js"
import { listAllocations, getAllocation, createAllocation, bulkCreateAllocations, updateAllocation, deleteAllocation } from "./controllers/allocations.js"
import { requireSignin, isAdmin, isTutor } from "./middleware/auth.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cookieParser())

// Test database connection endpoint
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()")
    res.json({
      message: "Hello World",
      database_connected: true,
      timestamp: result.rows[0].now,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Hello World",
      database_connected: false,
      error: err.message,
    })
  }
})

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1")
    res.json({ status: "healthy" })
  } catch (err) {
    res.status(503).json({ status: "unhealthy", error: err.message })
  }
})

// login endpoint
app.post("/api/login", login)

// Get current user endpoint
app.get("/api/current-user", requireSignin, currentUser)

// testing for admin and tutor role
app.get("/api/tutor-only", requireSignin, isTutor, (req, res) => {
  res.json({ message: "Welcome, Tutor!" })
})

app.get("/api/admin-only", requireSignin, isAdmin, (req, res) => {
  res.json({ message: "Welcome, Admin!" })
})

// Student CRUD endpoints (admin only)
app.get("/api/students", requireSignin, isAdmin, listStudents)
app.get("/api/students/:id", requireSignin, isAdmin, getStudent)
app.post("/api/students", requireSignin, isAdmin, createStudent)
app.put("/api/students/:id", requireSignin, isAdmin, updateStudent)
app.delete("/api/students/:id", requireSignin, isAdmin, deleteStudent)

// Teacher CRUD endpoints (admin only)
app.get("/api/teachers", requireSignin, isAdmin, listTeachers)
app.get("/api/teachers/:id", requireSignin, isAdmin, getTeacher)
app.post("/api/teachers", requireSignin, isAdmin, createTeacher)
app.put("/api/teachers/:id", requireSignin, isAdmin, updateTeacher)
app.delete("/api/teachers/:id", requireSignin, isAdmin, deleteTeacher)

// Allocation CRUD endpoints (admin only)
app.get("/api/allocations", requireSignin, isAdmin, listAllocations)
app.get("/api/allocations/:id", requireSignin, isAdmin, getAllocation)
app.post("/api/allocations/bulk", requireSignin, isAdmin, bulkCreateAllocations)
app.post("/api/allocations", requireSignin, isAdmin, createAllocation)
app.put("/api/allocations/:id", requireSignin, isAdmin, updateAllocation)
app.delete("/api/allocations/:id", requireSignin, isAdmin, deleteAllocation)

// Example usage of sendEmail function
app.get("/api/send-email", async (req, res) => {
  try {
    await sendEmail(
      "sawwinnnaung@gmail.com",
      "Test Email from eTutor",
      "<h1>Hello from eTutor!</h1><p>This is a test email sent using AWS SES.</p>",
    )
    res.json({ message: "Email sent successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  console.log(
    `Database URL: ${process.env.DATABASE_URL || "postgresql://etutor_user:etutor_password@localhost:5432/etutor_db"}`,
  )
})

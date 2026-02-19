import dotenv from "dotenv"
import express from "express"
import cookieParser from "cookie-parser"
import { pool } from "./utils/db.js"
import { sendEmail } from "./utils/mailer.js"
import { login, currentUser, logout } from "./controllers/auth.js"
import {
  createUser,
  adminDashboard,
  assignmentOptions,
  assignStudentsToTutor,
} from "./controllers/admin.js"
import { studentDashboard, tutorDashboard } from "./controllers/dashboard.js"
import { requireSignin, isAdmin, isTutor, isStudent } from "./middleware/auth.js"
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} from "./controllers/students.js"
import {
  listTutors,
  getTutor,
  createTutor,
  updateTutor,
  deleteTutor,
} from "./controllers/teachers.js"
import {
  listAllocations,
  getAllocation,
  createAllocation,
  bulkCreateAllocations,
  updateAllocation,
  deleteAllocation,
  listUnassignedStudents,
} from "./controllers/allocations.js"
import {
  listInbox,
  listMessages,
  sendMessage,
  listMessageContacts,
} from "./controllers/messages.js"
import {
  listBlogs,
  createBlog,
  getBlog,
  addBlogComment,
} from "./controllers/blogs.js"
import {
  listDocuments,
  createDocument,
  getDocument,
  addDocumentComment,
} from "./controllers/documents.js"
import {
  listMeetings,
  createMeeting,
  updateMeetingStatus,
} from "./controllers/meetings.js"
import {
  tutorGroupStats,
  adminSummary,
  studentEngagementSummary,
} from "./controllers/reports.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

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

// logout endpoint
app.post("/api/logout", requireSignin, logout)

// testing for admin and tutor role
app.get("/api/tutor-only", requireSignin, isTutor, (req, res) => {
  res.json({ message: "Welcome, Tutor!" })
})

app.get("/api/admin-only", requireSignin, isAdmin, (req, res) => {
  res.json({ message: "Welcome, Admin!" })
})

// Admin: create student/tutor accounts
app.post("/api/admin/users", requireSignin, isAdmin, createUser)

// Admin: view all dashboards data
app.get("/api/admin/dashboard", requireSignin, isAdmin, adminDashboard)

// Admin: get tutors/students list for assignment
app.get("/api/admin/assign-options", requireSignin, isAdmin, assignmentOptions)

// Admin: assign students to a tutor (minimum 10)
app.post(
  "/api/admin/assign-students",
  requireSignin,
  isAdmin,
  assignStudentsToTutor,
)

// Student dashboard
app.get("/api/student/dashboard", requireSignin, isStudent, studentDashboard)

// Tutor dashboard
app.get("/api/tutor/dashboard", requireSignin, isTutor, tutorDashboard)

// Student CRUD endpoints (admin only)
app.get("/api/students", requireSignin, isAdmin, listStudents)
app.get("/api/students/:id", requireSignin, isAdmin, getStudent)
app.post("/api/students", requireSignin, isAdmin, createStudent)
app.put("/api/students/:id", requireSignin, isAdmin, updateStudent)
app.delete("/api/students/:id", requireSignin, isAdmin, deleteStudent)

// Tutor CRUD endpoints (admin only)
app.get("/api/tutors", requireSignin, isAdmin, listTutors)
app.get("/api/tutors/:id", requireSignin, isAdmin, getTutor)
app.post("/api/tutors", requireSignin, isAdmin, createTutor)
app.put("/api/tutors/:id", requireSignin, isAdmin, updateTutor)
app.delete("/api/tutors/:id", requireSignin, isAdmin, deleteTutor)

// Allocation CRUD endpoints (admin only)
app.get("/api/allocations", requireSignin, isAdmin, listAllocations)
app.get("/api/allocations/unassigned", requireSignin, isAdmin, listUnassignedStudents)
app.get("/api/allocations/:id", requireSignin, isAdmin, getAllocation)
app.post("/api/allocations", requireSignin, isAdmin, createAllocation)
app.post("/api/allocations/bulk", requireSignin, isAdmin, bulkCreateAllocations)
app.put("/api/allocations/:id", requireSignin, isAdmin, updateAllocation)
app.delete("/api/allocations/:id", requireSignin, isAdmin, deleteAllocation)

// Messaging (student-tutor context)
app.get("/api/messages/inbox", requireSignin, listInbox)
app.get("/api/messages/contacts", requireSignin, listMessageContacts)
app.get("/api/messages", requireSignin, listMessages)
app.post("/api/messages", requireSignin, sendMessage)

// Blogging + comments/replies (relationship scoped)
app.get("/api/blogs", requireSignin, listBlogs)
app.post("/api/blogs", requireSignin, createBlog)
app.get("/api/blogs/:id", requireSignin, getBlog)
app.post("/api/blogs/:id/comments", requireSignin, addBlogComment)

// Documents + comments/replies (relationship scoped)
app.get("/api/documents", requireSignin, listDocuments)
app.post("/api/documents", requireSignin, createDocument)
app.get("/api/documents/:id", requireSignin, getDocument)
app.post("/api/documents/:id/comments", requireSignin, addDocumentComment)

// Meetings memory (physical/virtual)
app.get("/api/meetings", requireSignin, listMeetings)
app.post("/api/meetings", requireSignin, createMeeting)
app.patch("/api/meetings/:id/status", requireSignin, updateMeetingStatus)

// Reporting & dashboards
app.get("/api/reports/tutor/group-stats", requireSignin, isTutor, tutorGroupStats)
app.get("/api/reports/admin/summary", requireSignin, isAdmin, adminSummary)
app.get(
  "/api/reports/student/engagement-summary",
  requireSignin,
  isStudent,
  studentEngagementSummary,
)

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

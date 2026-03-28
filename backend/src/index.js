import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { pool } from "./utils/db.js";
import { sendEmail } from "./utils/mailer.js";
import { startInactivityCron } from "./cron/inactivityCheck.js";
import { login, currentUser, refresh, logout } from "./controllers/auth.js";
import {
  listStudents,
  listUnassignedStudents,
  listAssignedStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} from "./controllers/students.js";
import {
  listTutors,
  getTutor,
  listMyStudents,
  createTutor,
  updateTutor,
  deleteTutors,
} from "./controllers/teachers.js";
import {
  listAllocations,
  getAllocation,
  createAllocation,
  bulkCreateAllocations,
  updateAllocation,
  deleteAllocation,
  getAllocationStats,
} from "./controllers/allocations.js";
import {
  listInbox,
  listMessages,
  sendMessage,
  listMessageContacts,
} from "./controllers/messages.js";
import {
  listMeetings,
  createMeeting,
  updateMeeting,
  listAllMeetings,
} from "./controllers/meetings.js";
import {
  createBlog,
  listBlogs,
  getBlogGroup,
  getBlog,
  updateBlog,
  deleteBlog,
  addComment,
  getComments,
} from "./controllers/blogs.js";
import {
  listDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from "./controllers/documents.js";
import { documentUpload } from "./utils/documentUpload.js";
import { requireSignin, isAdmin, isTutor } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

// Test database connection endpoint
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Hello World",
      database_connected: true,
      timestamp: result.rows[0].now,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Hello World",
      database_connected: false,
      error: err.message,
    });
  }
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "healthy" });
  } catch (err) {
    res.status(503).json({ status: "unhealthy", error: err.message });
  }
});

// login endpoint
app.post("/api/login", login);

// Logout endpoint
app.post("/api/logout", requireSignin, logout);

// Refresh token endpoint
app.post("/api/refresh", refresh);

// Get current user endpoint
app.get("/api/current-user", requireSignin, currentUser);

// testing for admin and tutor role
app.get("/api/tutor-only", requireSignin, isTutor, (req, res) => {
  res.json({ message: "Welcome, Tutor!" });
});

app.get("/api/admin-only", requireSignin, isAdmin, (req, res) => {
  res.json({ message: "Welcome, Admin!" });
});

// Student CRUD endpoints (admin only)
app.get("/api/students", requireSignin, isAdmin, listStudents);
app.get(
  "/api/students/unassigned",
  requireSignin,
  isAdmin,
  listUnassignedStudents,
);
app.get("/api/students/assigned", requireSignin, isAdmin, listAssignedStudents);
app.get("/api/students/:id", requireSignin, isAdmin, getStudent);
app.post("/api/students", requireSignin, isAdmin, createStudent);
app.put("/api/students/:id", requireSignin, isAdmin, updateStudent);
app.delete("/api/students/:id", requireSignin, isAdmin, deleteStudent);

// Teacher CRUD endpoints (admin only)
app.get("/api/tutors", requireSignin, isAdmin, listTutors);
app.get("/api/tutors/me/students", requireSignin, isTutor, listMyStudents);
app.get("/api/tutors/:id", requireSignin, isAdmin, getTutor);
app.post("/api/tutors", requireSignin, isAdmin, createTutor);
app.put("/api/tutors/:id", requireSignin, isAdmin, updateTutor);
app.delete("/api/tutors/:id", requireSignin, isAdmin, deleteTutors);

// Allocation CRUD endpoints (admin only)
app.get("/api/allocations", requireSignin, isAdmin, listAllocations);
app.get("/api/allocations/stats", requireSignin, isAdmin, getAllocationStats);
app.post(
  "/api/allocations/bulk",
  requireSignin,
  isAdmin,
  bulkCreateAllocations,
);
app.get("/api/allocations/:id", requireSignin, isAdmin, getAllocation);
app.post("/api/allocations", requireSignin, isAdmin, createAllocation);
app.put("/api/allocations/:id", requireSignin, isAdmin, updateAllocation);
app.delete("/api/allocations/:id", requireSignin, isAdmin, deleteAllocation);

// Messaging endpoints between the assign tutor and student
app.get("/api/messages/inbox", requireSignin, listInbox);
app.get("/api/messages/contacts", requireSignin, listMessageContacts);
app.get("/api/messages", requireSignin, listMessages);
app.post("/api/messages", requireSignin, sendMessage);

// Meeting endpoints between the assign tutor and student
app.get("/api/meetings", requireSignin, listMeetings);
app.post("/api/meetings", requireSignin, createMeeting);
app.put("/api/meetings/:id", requireSignin, updateMeeting);

// Admin meeting endpoints
app.get("/api/admin/meetings", requireSignin, isAdmin, listAllMeetings);

// Blog endpoints (tutor creates, student views and comments)
app.get("/api/blogs", requireSignin, listBlogs);
app.get("/api/blogs/group/:groupId", requireSignin, isTutor, getBlogGroup);
app.get("/api/blogs/:id", requireSignin, getBlog);
app.post("/api/blogs", requireSignin, isTutor, createBlog);
app.put("/api/blogs/:id", requireSignin, isTutor, updateBlog);
app.delete("/api/blogs/:id", requireSignin, isTutor, deleteBlog);
app.get("/api/blogs/:id/comments", requireSignin, getComments);
app.post("/api/blogs/:id/comments", requireSignin, addComment);

// Documents (tutor + assigned students share visibility; upload for student/tutor)
app.get("/api/documents", requireSignin, listDocuments);
app.post(
  "/api/documents",
  requireSignin,
  documentUpload.single("file"),
  uploadDocument,
);
app.get("/api/documents/:id/download", requireSignin, downloadDocument);
app.delete("/api/documents/:id", requireSignin, deleteDocument);

// Example usage of sendEmail function
app.get("/api/send-email", async (req, res) => {
  try {
    await sendEmail(
      "sawwinnnaung@gmail.com",
      "Test Email from eTutor",
      "<h1>Hello from eTutor!</h1><p>This is a test email sent using AWS SES.</p>",
    );
    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(
    `Database URL: ${process.env.DATABASE_URL || "postgresql://etutor_user:etutor_password@postgres:5432/etutor_db"}`,
  );
  startInactivityCron();
});

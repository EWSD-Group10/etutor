require("dotenv").config()
const express = require("express")
const { Pool } = require("pg")
const { sendEmail } = require("./utils/mailer")

const app = express()
const PORT = process.env.PORT || 3000

// PostgreSQL connection pool
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://etutor_user:etutor_password@localhost:5432/etutor_db",
})

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err)
})

app.use(express.json())

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

// Get all users endpoint
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, first_name, last_name, role FROM users",
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

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

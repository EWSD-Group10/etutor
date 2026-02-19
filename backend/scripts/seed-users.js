import fs from "fs"
import path from "path"
import csv from "csv-parser"
import { Pool } from "pg"
import crypto from "crypto"
import { hashPassword } from "../src/utils/auth.js"
import dotenv from "dotenv"

dotenv.config()

const pool = new Pool({
  user: process.env.DB_USER || "etutor_user",
  password: process.env.DB_PASSWORD || "etutor_password",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "etutor_db",
})

async function seedUsers(csvFilePath) {
  const users = []
  const errors = []
  let rowNumber = 1

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        rowNumber++

        // Validate required fields
        if (!row.email || !row.password || !row.name || !row.role) {
          errors.push(
            `Row ${rowNumber}: Missing required fields. Required: email, password, name, role`,
          )
          return
        }

        // Validate role
        const validRoles = ["student", "tutor", "admin"]
        if (!validRoles.includes(row.role.toLowerCase())) {
          errors.push(
            `Row ${rowNumber}: Invalid role "${row.role}". Must be one of: ${validRoles.join(", ")}`,
          )
          return
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(row.email)) {
          errors.push(`Row ${rowNumber}: Invalid email format "${row.email}"`)
          return
        }

        users.push({
          email: row.email.trim().toLowerCase(),
          password: row.password.trim(),
          name: row.name.trim(),
          role: row.role.trim().toLowerCase(),
          degree_program: row.degree_program ? row.degree_program.trim() : null,
          department: row.department ? row.department.trim() : null,
        })
      })
      .on("end", async () => {
        if (errors.length > 0) {
          console.error("\n[ERROR] Validation Errors:")
          errors.forEach((err) => console.error(`  ${err}`))
          reject(new Error("CSV validation failed"))
          return
        }

        if (users.length === 0) {
          console.error("[ERROR] No valid users found in CSV file")
          reject(new Error("No valid users to import"))
          return
        }

        try {
          await insertUsers(users)
          console.log(`Successfully imported ${users.length} users`)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
      .on("error", (error) => {
        reject(new Error(`Failed to read CSV file: ${error.message}`))
      })
  })
}

async function insertUsers(users) {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const query = `
      INSERT INTO users (id, email, password_hash, name, role, degree_program, department, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, name, role;
    `

    let insertedCount = 0
    let skippedCount = 0

    for (const user of users) {
      const passwordHash = await hashPassword(user.password)

      const now = new Date()
      const id = crypto.randomUUID()
      const result = await client.query(query, [
        id,
        user.email,
        passwordHash,
        user.name,
        user.role,
        user.degree_program,
        user.department,
        true,
        now,
        now,
      ])

      if (result.rows.length > 0) {
        insertedCount++
        console.log(
          `  [CREATED] user: ${result.rows[0].email} (${result.rows[0].role})`,
        )
      } else {
        skippedCount++
        console.log(`  [SKIPPED] ${user.email} (already exists)`)
      }
    }

    await client.query("COMMIT")

    console.log(`\nSummary: ${insertedCount} inserted, ${skippedCount} skipped`)
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

async function main() {
  const csvPath = process.argv[2]

  if (!csvPath) {
    console.error(
      "[ERROR] Usage: node scripts/seed-users.js <path-to-csv-file>",
    )
    console.error("\nExample: node scripts/seed-users.js ./data/users.csv")
    process.exit(1)
  }

  // Resolve to full path
  const fullPath = path.resolve(csvPath)

  if (!fs.existsSync(fullPath)) {
    console.error(`[ERROR] File not found: ${fullPath}`)
    process.exit(1)
  }

  console.log(`Reading CSV file: ${fullPath}\n`)

  try {
    await seedUsers(fullPath)
    console.log("\nSeeding completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error(`\n[ERROR] ${error.message}`)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()

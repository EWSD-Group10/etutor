import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ override: true });

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://etutor_user:etutor_password@postgres:5432/etutor_db",
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

export { pool };

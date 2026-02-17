import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../generated/prisma/client.ts"
import { pool } from "./db.js"

const adapter = new PrismaPg(pool)
export const prisma = new PrismaClient({ adapter })

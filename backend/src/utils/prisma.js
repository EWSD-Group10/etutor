import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";
import { pool } from "./db.js";

const { PrismaClient } = pkg;

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

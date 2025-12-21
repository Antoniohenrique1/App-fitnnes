import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  // throw new Error("DATABASE_URL environment variable is required");
  console.warn("DATABASE_URL environment variable is missing. Database functionality will be limited.");
}

const { Pool } = pg;

// Create pool for session store
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://dummy:dummy@localhost:5432/dummy",
});

export const db = drizzle(pool, { schema });

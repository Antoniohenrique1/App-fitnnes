import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create pool for session store
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle({
  connection: process.env.DATABASE_URL,
  ws: ws,
  schema,
});

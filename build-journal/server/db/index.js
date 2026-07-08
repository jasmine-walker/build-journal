import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// A connection pool reuses database connections instead of opening a new one
// per request. Supabase and most hosts require SSL, so we enable it here.
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

// Small helper so routes can run queries without touching the pool directly.
export function query(text, params) {
  return pool.query(text, params);
}

export default pool;

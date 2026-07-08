import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./index.js";

// Reads schema.sql and runs it against the database.
// Run once after setting DATABASE_URL:  npm run init-db
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  try {
    await pool.query(schema);
    console.log("Database ready: users and sets tables created.");
  } catch (err) {
    console.error("Failed to initialize database:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

init();

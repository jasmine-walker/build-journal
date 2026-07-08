import { newDb } from "pg-mem";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";

process.env.JWT_SECRET = "test-secret";

// Spin up an in-memory Postgres and load the real schema.
const mem = newDb();
const schema = fs.readFileSync("./db/schema.sql", "utf8");
mem.public.none(schema);
const { Pool } = mem.adapters.createPg();
const pool = new Pool();
const query = (text, params) => pool.query(text, params);

let pass = 0, fail = 0;
const ok = (cond, label) => { cond ? (pass++, console.log("  ok  " + label)) : (fail++, console.log("FAIL  " + label)); };

// --- register ---
const hash = await bcrypt.hash("demo1234", 10);
const reg = await query(
  "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
  ["jasmine@test.com", hash]
);
ok(reg.rows[0].email === "jasmine@test.com", "register inserts a user and returns it");
ok(reg.rows[0].id === 1, "new user gets an id");

// --- duplicate email guard ---
const dup = await query("SELECT id FROM users WHERE email = $1", ["jasmine@test.com"]);
ok(dup.rows.length === 1, "duplicate email lookup finds the existing account");

// --- login: correct password ---
const found = await query("SELECT id, password_hash FROM users WHERE email = $1", ["jasmine@test.com"]);
ok(await bcrypt.compare("demo1234", found.rows[0].password_hash), "correct password verifies");
ok(!(await bcrypt.compare("wrongpass", found.rows[0].password_hash)), "wrong password is rejected");

// --- token round-trip ---
const token = jwt.sign({ userId: found.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const decoded = jwt.verify(token, process.env.JWT_SECRET);
ok(decoded.userId === 1, "JWT signs and verifies back to the right user");

// --- status check constraint ---
await query("INSERT INTO sets (user_id, name, status) VALUES ($1, $2, $3)", [1, "Hogwarts Castle", "owned"]);
let constraintHeld = false;
try {
  await query("INSERT INTO sets (user_id, name, status) VALUES ($1, $2, $3)", [1, "Bad Set", "not-a-status"]);
} catch { constraintHeld = true; }
ok(constraintHeld, "status CHECK constraint rejects invalid values");

// --- cascade ownership ---
const mySets = await query("SELECT name FROM sets WHERE user_id = $1", [1]);
ok(mySets.rows.length === 1 && mySets.rows[0].name === "Hogwarts Castle", "sets are scoped to their owner");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

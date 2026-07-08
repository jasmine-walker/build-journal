import { newDb } from "pg-mem";
import fs from "fs";
import { parseSet } from "./routes/sets.js";

const mem = newDb();
mem.public.none(fs.readFileSync("./db/schema.sql", "utf8"));
const { Pool } = mem.adapters.createPg();
const pool = new Pool();
const query = (t, p) => pool.query(t, p);

let pass = 0, fail = 0;
const ok = (c, l) => { c ? (pass++, console.log("  ok  " + l)) : (fail++, console.log("FAIL  " + l)); };

// two users
await query("INSERT INTO users (email, password_hash) VALUES ($1,$2)", ["a@test.com", "x"]);
await query("INSERT INTO users (email, password_hash) VALUES ($1,$2)", ["b@test.com", "x"]);

// user 1 adds two sets, user 2 adds one
await query("INSERT INTO sets (user_id,name,theme,piece_count,status) VALUES (1,'Hogwarts Castle','Harry Potter',6020,'owned')");
await query("INSERT INTO sets (user_id,name,theme,piece_count,status) VALUES (1,'Bonsai Tree','Botanical',878,'wishlist')");
await query("INSERT INTO sets (user_id,name,theme,piece_count,status) VALUES (2,'Optimus Prime','Icons',1508,'owned')");

// scoping: user 1 sees only their two
const u1 = await query("SELECT name FROM sets WHERE user_id = $1 ORDER BY name ASC", [1]);
ok(u1.rows.length === 2, "list is scoped to the owner (user 1 sees 2 sets)");
ok(u1.rows[0].name === "Bonsai Tree", "name sort works");

// filter by status
const owned = await query("SELECT name FROM sets WHERE user_id=$1 AND status=$2", [1, "owned"]);
ok(owned.rows.length === 1 && owned.rows[0].name === "Hogwarts Castle", "status filter works");

// update guard: user 2 cannot edit user 1's set
const badUpdate = await query(
  "UPDATE sets SET name=$1 WHERE id=$2 AND user_id=$3 RETURNING id",
  ["Hacked", 1, 2]
);
ok(badUpdate.rows.length === 0, "user cannot edit another user's set");

// update own: user 1 can
const goodUpdate = await query(
  "UPDATE sets SET status=$1 WHERE id=$2 AND user_id=$3 RETURNING status",
  ["building", 1, 1]
);
ok(goodUpdate.rows[0]?.status === "building", "user can edit their own set");

// delete guard
const badDelete = await query("DELETE FROM sets WHERE id=$1 AND user_id=$2 RETURNING id", [1, 2]);
ok(badDelete.rows.length === 0, "user cannot delete another user's set");

// parseSet validation
ok(parseSet({}).error === "Name is required", "parseSet rejects a missing name");
ok(parseSet({ name: "X", status: "bogus" }).error === "Invalid status", "parseSet rejects a bad status");
ok(parseSet({ name: "X", piece_count: "-5" }).error, "parseSet rejects a negative piece count");
ok(parseSet({ name: "  Falcon  " }).value.name === "Falcon", "parseSet trims the name");
ok(parseSet({ name: "X" }).value.status === "wishlist", "parseSet defaults status to wishlist");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

import express from "express";
import { query } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Every route in this file requires a logged-in user.
router.use(requireAuth);

const STATUSES = ["owned", "building", "wishlist"];

// Whitelist of sort options. We never drop user input straight into ORDER BY,
// so this map is what keeps sorting safe from SQL injection.
const SORTS = {
  newest: "created_at DESC",
  name: "name ASC",
  pieces: "piece_count DESC NULLS LAST",
  theme: "theme ASC NULLS LAST",
};

// Validates and cleans up an incoming set payload before it touches the database.
export function parseSet(body) {
  const name = (body.name || "").trim();
  if (!name) return { error: "Name is required" };

  const status = body.status;
  if (status && !STATUSES.includes(status)) return { error: "Invalid status" };

  const raw = body.piece_count;
  const pieceCount = raw === "" || raw == null ? null : Number(raw);
  if (pieceCount !== null && (!Number.isInteger(pieceCount) || pieceCount < 0)) {
    return { error: "Piece count must be a whole number" };
  }

  return {
    value: {
      name,
      set_number: (body.set_number || "").trim() || null,
      theme: (body.theme || "").trim() || null,
      piece_count: pieceCount,
      status: status || "wishlist",
      notes: (body.notes || "").trim() || null,
    },
  };
}

// GET /api/sets?search=&status=&sort=   ->  this user's collection
router.get("/", async (req, res) => {
  const { search, status, sort } = req.query;
  const where = ["user_id = $1"];
  const params = [req.userId];

  if (search) {
    params.push(`%${search}%`);
    where.push(`name ILIKE $${params.length}`);
  }
  if (status && STATUSES.includes(status)) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  const orderBy = SORTS[sort] || SORTS.newest;

  try {
    const result = await query(
      `SELECT id, name, set_number, theme, piece_count, status, notes, created_at
       FROM sets WHERE ${where.join(" AND ")} ORDER BY ${orderBy}`,
      params
    );
    res.json({ sets: result.rows });
  } catch (err) {
    console.error("list sets:", err.message);
    res.status(500).json({ error: "Could not load sets" });
  }
});

// POST /api/sets   ->  add a set to this user's collection
router.post("/", async (req, res) => {
  const parsed = parseSet(req.body || {});
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const s = parsed.value;

  try {
    const result = await query(
      `INSERT INTO sets (user_id, name, set_number, theme, piece_count, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, set_number, theme, piece_count, status, notes, created_at`,
      [req.userId, s.name, s.set_number, s.theme, s.piece_count, s.status, s.notes]
    );
    res.status(201).json({ set: result.rows[0] });
  } catch (err) {
    console.error("create set:", err.message);
    res.status(500).json({ error: "Could not add set" });
  }
});

// PUT /api/sets/:id   ->  update a set (only if it belongs to this user)
router.put("/:id", async (req, res) => {
  const parsed = parseSet(req.body || {});
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const s = parsed.value;

  try {
    // The "AND user_id = $8" is the guard: you can only edit your own sets.
    const result = await query(
      `UPDATE sets SET name = $1, set_number = $2, theme = $3, piece_count = $4, status = $5, notes = $6
       WHERE id = $7 AND user_id = $8
       RETURNING id, name, set_number, theme, piece_count, status, notes, created_at`,
      [s.name, s.set_number, s.theme, s.piece_count, s.status, s.notes, req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Set not found" });
    res.json({ set: result.rows[0] });
  } catch (err) {
    console.error("update set:", err.message);
    res.status(500).json({ error: "Could not update set" });
  }
});

// DELETE /api/sets/:id   ->  remove a set (only if it belongs to this user)
router.delete("/:id", async (req, res) => {
  try {
    const result = await query(
      "DELETE FROM sets WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Set not found" });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error("delete set:", err.message);
    res.status(500).json({ error: "Could not delete set" });
  }
});

export default router;

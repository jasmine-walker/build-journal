import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Creates a signed token that proves who the user is on future requests.
// It expires in 7 days, after which they'll need to log in again.
function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/register  ->  create an account
router.post("/register", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const existing = await query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ error: "An account with that email already exists" });
    }

    // Never store the raw password. bcrypt hashes it with a salt so even we
    // can't read it, and matching passwords produce different stored values.
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email.toLowerCase(), passwordHash]
    );
    const user = result.rows[0];

    res.status(201).json({ token: signToken(user.id), user });
  } catch (err) {
    console.error("register error:", err.message);
    res.status(500).json({ error: "Could not create account" });
  }
});

// POST /api/auth/login  ->  exchange email + password for a token
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    const user = result.rows[0];

    // Same generic message whether the email is unknown or the password is
    // wrong, so we don't reveal which emails have accounts.
    const passwordOk = user && (await bcrypt.compare(password, user.password_hash));
    if (!passwordOk) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ token: signToken(user.id), user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("login error:", err.message);
    res.status(500).json({ error: "Could not log in" });
  }
});

// GET /api/auth/me  ->  who am I? (used by the client to restore a session)
router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await query("SELECT id, email FROM users WHERE id = $1", [req.userId]);
    if (!result.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("me error:", err.message);
    res.status(500).json({ error: "Could not load user" });
  }
});

export default router;

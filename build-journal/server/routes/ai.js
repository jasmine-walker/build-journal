import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { query } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

// Configurable so you can swap models without touching code.
// claude-sonnet-5 is current as of July 2026 and a good fit for a light,
// creative feature like this.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

// Only create the client if a key exists, so the app still runs (minus AI)
// during local setup before you've added your key.
const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// The two AI modes behind one button. Each has its own persona and task.
const MODES = {
  recommend: {
    system:
      "You are a friendly, knowledgeable LEGO expert who gives concise, specific recommendations. Keep replies warm, practical, and under 60 words.",
    instruction:
      "Here is someone's LEGO collection. Recommend ONE specific set they should build or buy next, and explain in 2-3 sentences why it fits what they already own. If the collection is empty, suggest a great starter set.",
  },
  challenge: {
    system:
      "You are a playful LEGO building coach who invents fun, creative building challenges. Keep replies warm and under 60 words.",
    instruction:
      "Here is someone's LEGO collection. Invent ONE creative build challenge that draws on the sets or themes they already own, such as combining pieces from two themes. If the collection is empty, invent a fun beginner challenge.",
  },
};

// Turns the user's rows into a compact text list for the model to read.
export function summarizeCollection(sets) {
  if (!sets.length) return "The collection is currently empty.";
  return sets
    .map((s) => {
      const theme = s.theme ? ` (${s.theme})` : "";
      const pieces = s.piece_count ? `, ${s.piece_count} pieces` : "";
      return `- ${s.name}${theme}${pieces} [${s.status}]`;
    })
    .join("\n");
}

// POST /api/ai/suggest   body: { mode: "recommend" | "challenge" }
router.post("/suggest", async (req, res) => {
  const mode = req.body?.mode || "recommend";
  if (!MODES[mode]) return res.status(400).json({ error: "Unknown suggestion mode" });
  if (!client) {
    return res.status(503).json({ error: "AI is not configured. Add ANTHROPIC_API_KEY to enable suggestions." });
  }

  try {
    const result = await query(
      "SELECT name, theme, piece_count, status FROM sets WHERE user_id = $1",
      [req.userId]
    );
    const collection = summarizeCollection(result.rows);
    const { system, instruction } = MODES[mode];

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system,
      messages: [{ role: "user", content: `${instruction}\n\nCollection:\n${collection}` }],
    });

    const suggestion = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    res.json({ mode, suggestion });
  } catch (err) {
    console.error("ai suggest:", err.message);
    res.status(502).json({ error: "The AI suggestion failed. Please try again." });
  }
});

export default router;

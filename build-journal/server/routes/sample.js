import express from "express";

const router = express.Router();

// A fixed, read-only collection shown to visitors who haven't signed up yet.
// This powers the logged-out preview so the app never greets anyone empty.
const SAMPLE_SETS = [
  { id: "s1", name: "Hogwarts Castle", set_number: "71043", theme: "Harry Potter", piece_count: 6020, status: "owned" },
  { id: "s2", name: "NASA Apollo Saturn V", set_number: "92176", theme: "Icons", piece_count: 1969, status: "building" },
  { id: "s3", name: "Millennium Falcon", set_number: "75192", theme: "Star Wars", piece_count: 7541, status: "wishlist" },
  { id: "s4", name: "Bonsai Tree", set_number: "10281", theme: "Botanical", piece_count: 878, status: "owned" },
  { id: "s5", name: "Optimus Prime", set_number: "10302", theme: "Icons", piece_count: 1508, status: "owned" },
  { id: "s6", name: "Typewriter", set_number: "21327", theme: "Ideas", piece_count: 2079, status: "wishlist" },
];

// GET /api/sample  ->  the preview collection (no auth required)
router.get("/", (req, res) => {
  res.json({ sets: SAMPLE_SETS });
});

export default router;

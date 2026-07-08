import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import setRoutes from "./routes/sets.js";
import sampleRoutes from "./routes/sample.js";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const app = express();

// Allow the React client (running on a different port/domain) to call this API.
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

// Simple health check so we can confirm the server is up before wiring the rest.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "build-journal-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/sets", setRoutes);
app.use("/api/sample", sampleRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Build Journal API listening on http://localhost:${PORT}`);
});

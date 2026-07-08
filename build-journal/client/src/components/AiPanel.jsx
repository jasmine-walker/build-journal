import { useState } from "react";
import { api } from "../api";

// The dual-mode AI feature: a toggle picks the mode, one button runs it,
// and the result shows in a banner. Both modes hit the same endpoint.
export default function AiPanel() {
  const [mode, setMode] = useState("recommend");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const ask = async () => {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const { suggestion } = await api.suggest(mode);
      setResult(suggestion);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel">
      <div className="ai-controls">
        <div className="ai-toggle">
          <button
            className={`ai-mode ${mode === "recommend" ? "ai-mode-active" : ""}`}
            onClick={() => setMode("recommend")}
          >
            What to build next
          </button>
          <button
            className={`ai-mode ${mode === "challenge" ? "ai-mode-active" : ""}`}
            onClick={() => setMode("challenge")}
          >
            Build challenge
          </button>
        </div>
        <button className="btn btn-primary" onClick={ask} disabled={loading}>
          {loading ? "Thinking…" : "✦ Ask AI"}
        </button>
      </div>
      {error && <p className="error ai-result">{error}</p>}
      {result && <p className="ai-result">{result}</p>}
    </div>
  );
}

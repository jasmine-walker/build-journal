import { useState, useEffect } from "react";
import { Eye, Sparkles } from "lucide-react";
import { api } from "../api";
import SetGrid from "./SetGrid.jsx";
import StatsStrip from "./StatsStrip.jsx";

// What logged-out visitors see: a real, working sample collection so the app
// never greets anyone empty. Any action nudges them to create an account.
export default function Preview({ onRequireAuth }) {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .sample()
      .then(({ sets }) => setSets(sets))
      .catch(() => setSets([]))
      .finally(() => setLoading(false));
  }, []);

  const nudge = () => onRequireAuth("Create a free account to save your own collection and unlock AI suggestions.");

  return (
    <>
      <div className="banner">
        <span className="banner-text"><Eye size={16} /> You're viewing a sample collection.</span>
        <button className="link-btn" onClick={nudge}>
          Sign up to start your own
        </button>
      </div>

      <StatsStrip sets={sets} />

      <div className="ai-panel">
        <div className="ai-controls">
          <div className="ai-toggle">
            <span className="ai-mode ai-mode-active">What to build next</span>
            <span className="ai-mode">Build challenge</span>
          </div>
          <button className="btn btn-yellow" onClick={nudge}>
            <Sparkles size={15} strokeWidth={2.5} /> Ask AI
          </button>
        </div>
      </div>

      {loading ? (
        <p className="muted">Loading sample…</p>
      ) : (
        <SetGrid sets={sets} readOnly />
      )}
    </>
  );
}

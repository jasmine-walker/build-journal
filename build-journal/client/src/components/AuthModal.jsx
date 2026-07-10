import { useState } from "react";
import { Sparkles } from "lucide-react";
import { api } from "../api";

const DEMO = { email: "demo@buildjournal.app", password: "demo1234" };

export default function AuthModal({ mode, message, onClose, onAuthed, onSwitchMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  const finish = (token, user) => {
    localStorage.setItem("token", token);
    onAuthed(user);
  };

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      const fn = isRegister ? api.register : api.login;
      const { token, user } = await fn(email, password);
      finish(token, user);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  const tryDemo = async () => {
    setError("");
    setBusy(true);
    try {
      const { token, user } = await api.login(DEMO.email, DEMO.password);
      finish(token, user);
    } catch (e) {
      setError("The demo account isn't available right now.");
      setBusy(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-narrow" onClick={(e) => e.stopPropagation()}>
        <div className="modal-pips">
          <span className="pip" style={{ background: "#E02A25" }} />
          <span className="pip" style={{ background: "#FFCF00" }} />
          <span className="pip" style={{ background: "#1A6DD5" }} />
        </div>
        <h2 className="modal-title">{isRegister ? "Create your account" : "Welcome back"}</h2>
        {message && <p className="auth-message">{message}</p>}

        <label className="field-label">Email</label>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />

        <label className="field-label">Password</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isRegister ? "At least 8 characters" : "••••••••"}
        />

        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary btn-block" onClick={submit} disabled={busy}>
          {busy ? "Please wait…" : isRegister ? "Sign up" : "Log in"}
        </button>

        <div className="demo-box">
          <p className="demo-title"><Sparkles size={14} strokeWidth={2.5} /> Just exploring?</p>
          <p className="demo-cred">demo@buildjournal.app &middot; demo1234</p>
          <button className="btn btn-ghost btn-block" onClick={tryDemo} disabled={busy}>
            Try the demo account
          </button>
        </div>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <button className="link-btn" onClick={() => onSwitchMode(isRegister ? "login" : "register")}>
            {isRegister ? "Log in" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}

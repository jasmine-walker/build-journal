import { useState } from "react";
import { api } from "../api";

export default function AuthModal({ mode, message, onClose, onAuthed, onSwitchMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      const fn = isRegister ? api.register : api.login;
      const { token, user } = await fn(email, password);
      localStorage.setItem("token", token);
      onAuthed(user);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-narrow" onClick={(e) => e.stopPropagation()}>
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

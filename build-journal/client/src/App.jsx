import { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import Header from "./components/Header.jsx";
import Collection from "./components/Collection.jsx";
import Preview from "./components/Preview.jsx";
import AuthModal from "./components/AuthModal.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");

  // On load, if we have a saved token, ask the API who we are to restore the
  // session. If the token is stale, quietly drop it.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const openAuth = useCallback((mode = "login", message = "") => {
    setAuthMode(mode);
    setAuthMessage(message);
    setAuthOpen(true);
  }, []);

  const handleAuthed = (loggedInUser) => {
    setUser(loggedInUser);
    setAuthOpen(false);
    setAuthMessage("");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) return <div className="center-screen">Loading…</div>;

  return (
    <div className="app">
      <Header
        user={user}
        onLogin={() => openAuth("login")}
        onSignup={() => openAuth("register")}
        onLogout={logout}
      />
      <main className="container">
        {user ? (
          <Collection />
        ) : (
          <Preview onRequireAuth={(msg) => openAuth("register", msg)} />
        )}
      </main>
      <Footer />
      {authOpen && (
        <AuthModal
          mode={authMode}
          message={authMessage}
          onClose={() => setAuthOpen(false)}
          onAuthed={handleAuthed}
          onSwitchMode={setAuthMode}
        />
      )}
    </div>
  );
}

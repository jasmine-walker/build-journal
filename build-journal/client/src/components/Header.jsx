export default function Header({ user, onLogin, onSignup, onLogout }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand-wrap">
          <span className="brand">
            <span className="brand-pips">
              <span className="pip" style={{ background: "#E02A25" }} />
              <span className="pip" style={{ background: "#1A6DD5" }} />
              <span className="pip" style={{ background: "#3EA33F" }} />
            </span>
            LEGO&reg; Build Journal
          </span>
          <span className="header-tagline">Your LEGO&reg; sets, organized.</span>
        </div>
        <div className="header-actions">
          {user ? (
            <>
              <span className="header-email">{user.email}</span>
              <button className="btn btn-ghost" onClick={onLogout}>Log out</button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={onLogin}>Log in</button>
              <button className="btn btn-primary" onClick={onSignup}>Sign up</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

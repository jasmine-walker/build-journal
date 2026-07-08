export default function Header({ user, onLogin, onSignup, onLogout }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <span className="brand">
          <span className="brand-mark">▮▮</span> Build Journal
        </span>
        <div className="header-actions">
          {user ? (
            <>
              <span className="header-email">{user.email}</span>
              <button className="btn btn-ghost" onClick={onLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={onLogin}>
                Log in
              </button>
              <button className="btn btn-primary" onClick={onSignup}>
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

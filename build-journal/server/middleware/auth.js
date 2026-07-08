import jwt from "jsonwebtoken";

// Protects routes that require a logged-in user.
// It reads the "Authorization: Bearer <token>" header, verifies the token,
// and attaches the user's id to the request so the route knows who's asking.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

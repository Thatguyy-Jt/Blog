// --- middleware/auth.js ---
const jwt = require("jsonwebtoken");
const { User } = require("../models/User.js");

// ✅ Middleware: Require Authentication
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// ✅ Middleware: Role-based Access
function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!allowed.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

// ✅ Set authentication cookie
function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: true, // Always true since Render uses HTTPS
    sameSite: "none", // Needed for cross-domain (Render ↔ Vercel)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// ✅ Clear authentication cookie
function clearAuthCookie(res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
}

module.exports = {
  requireAuth,
  requireRole,
  setAuthCookie,
  clearAuthCookie,
};

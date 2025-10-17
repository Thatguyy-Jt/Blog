// --- middleware/auth.js ---
const jwt = require("jsonwebtoken");
const { User } = require("../models/User.js");

// ✅ Require Authentication Middleware
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

// ✅ Role-based Access Middleware
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

// ✅ Set Cookie (Cross-Platform + Mobile Safe)
function setAuthCookie(res, token) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,        // Use secure only in production
      sameSite: isProduction ? "None" : "Lax",    // Use SameSite=None only in production
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });
}

// ✅ Clear Cookie
function clearAuthCookie(res) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    });
}
module.exports = {
  requireAuth,
  requireRole,
  setAuthCookie,
  clearAuthCookie,
};
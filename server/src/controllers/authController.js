// --- Converted to CommonJS (controllers/authController.js) ---
const jwt = require("jsonwebtoken");
const { User } = require("../models/User.js");
const { clearAuthCookie, setAuthCookie } = require("../middleware/auth.js");

function createJwt(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
}

// ✅ REGISTER
async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ username, email, passwordHash });

    const token = createJwt(user._id);
    setAuthCookie(res, token);

    return res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
}

// ✅ LOGIN
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = createJwt(user._id);
    setAuthCookie(res, token);

    return res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
}

// ✅ LOGOUT
async function logout(_req, res) {
  clearAuthCookie(res);
  return res.json({ message: "Logged out" });
}

// ✅ CURRENT USER
async function me(req, res) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  // req.user is already populated in requireAuth middleware
  return res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  logout,
  me,
};

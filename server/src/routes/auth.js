// --- Converted to CommonJS (routes/auth.js) ---
const { Router } = require('express');
const { login, logout, me, register } = require('../controllers/authController.js');
const { requireAuth } = require('../middleware/auth.js');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

module.exports = router;

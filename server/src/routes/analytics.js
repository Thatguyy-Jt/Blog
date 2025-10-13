// --- Converted to CommonJS (routes/analytics.js) ---
const { Router } = require('express');
const { summary } = require('../controllers/analyticsController.js');
const { requireAuth, requireRole } = require('../middleware/auth.js');

const router = Router();

router.get('/summary', requireAuth, requireRole('author', 'admin'), summary);

module.exports = router;

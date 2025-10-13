// --- Converted to CommonJS (routes/categories.js) ---
const { Router } = require('express');
const { createCategory, deleteCategory, listCategories, updateCategory } = require('../controllers/categoryController.js');
const { requireAuth, requireRole } = require('../middleware/auth.js');

const router = Router();

router.get('/', listCategories);
router.post('/', requireAuth, requireRole('admin'), createCategory);
router.put('/:id', requireAuth, requireRole('admin'), updateCategory);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCategory);

module.exports = router;

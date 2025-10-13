// --- Updated routes/comments.js ---
const { Router } = require('express');
const { createComment, deleteComment, listComments } = require('../controllers/commentController.js');
const { requireAuth } = require('../middleware/auth.js');

const router = Router();

// ✅ Get all comments for a specific post (public)
router.get('/post/:id', listComments);

// ✅ Create a comment (only for authenticated users)
router.post('/post/:id', requireAuth, createComment);

// ✅ Delete a comment (only the author or admin can delete)
router.delete('/:commentId', requireAuth, deleteComment);

module.exports = router;

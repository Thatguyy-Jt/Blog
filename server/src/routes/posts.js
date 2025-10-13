const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAuth } = require('../middleware/auth.js');
const {
  createPost,
  getPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  toggleBookmark,  
} = require('../controllers/postController.js');

const upload = multer(); // memory storage for Cloudinary

// Create post with image
router.post('/', requireAuth, upload.single('image'), createPost);

// Other routes
router.get('/', getPosts);
router.get('/mine', requireAuth, getMyPosts);
router.get('/:id', getPostById);
router.put('/:id', requireAuth, upload.single('image'), updatePost);
router.delete('/:id', requireAuth, deletePost);
router.post('/:id/like', requireAuth, toggleLike);
router.post('/:id/bookmark', requireAuth, toggleBookmark);
module.exports = router;

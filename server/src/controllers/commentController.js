// --- Updated controllers/commentController.js ---
const { Comment } = require('../models/Comment.js');

// ✅ Get all comments for a post (no approval filter needed anymore)
async function listComments(req, res) {
  try {
    const { id } = req.params; // post ID
    const comments = await Comment.find({ post: id })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments', error: error.message });
  }
}

// ✅ Create a comment (auto-approved, only for logged-in users)
async function createComment(req, res) {
  try {
    const { id } = req.params; // post ID
    const { content, parent } = req.body;

    if (!content || content.trim().length < 2) {
      return res.status(400).json({ message: 'Comment too short' });
    }

    const comment = await Comment.create({
      post: id,
      author: req.user._id,
      content: content.trim(),
      parent: parent || null,
      status: 'approved', // instantly approved
    });

    await comment.populate('author', 'username');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Failed to create comment', error: error.message });
  }
}

// ✅ Delete a comment (only the author or admin can delete)
async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the logged-in user is the author or an admin
    if (comment.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment', error: error.message });
  }
}

module.exports = {
  listComments,
  createComment,
  deleteComment,
};

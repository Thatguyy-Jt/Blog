// --- Converted to CommonJS (models/Comment.js) ---
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  },
  { timestamps: true }
);

const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

module.exports = { Comment };

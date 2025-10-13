
const { Post } = require('../models/Post.js');
const { Comment } = require('../models/Comment.js');

async function summary(req, res) {
  const userId = req.user.role === 'admin' ? null : req.user._id;
  const postMatch = userId ? { author: userId } : {};

  const [postsCount, commentsCount, totalViews, topPosts] = await Promise.all([
    Post.countDocuments(postMatch),
    Comment.countDocuments(userId ? { author: userId } : {}),
    Post.aggregate([{ $match: postMatch }, { $group: { _id: null, v: { $sum: '$views' } } }]).then(r => r[0]?.v || 0),
    Post.find(postMatch).sort({ views: -1 }).limit(5).select('title views createdAt'),
  ]);

  res.json({ postsCount, commentsCount, totalViews, topPosts });
}

module.exports = {
  summary,
};

const mongoose = require('mongoose');
const { Post } = require('../models/Post.js');
const { User } = require('../models/User.js');
const { Category } = require('../models/Category.js');
const cloudinary = require("../config/cloudinary.js");
const streamifier = require("streamifier");

// Utility: Upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = "blog_posts") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Utility: Safely parse JSON strings
function safeParseJSON(value, fallback = []) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// ✅ Create Post
async function createPost(req, res) {
  try {
    let { title, content, status = "published", categories, tags } = req.body;
    if (!title || !content)
      return res.status(400).json({ message: "Title and content required" });

    // Normalize categories to array
    const incomingCategories = Array.isArray(categories)
      ? categories
      : categories
      ? [categories]
      : [];

    const tagArray = safeParseJSON(tags);

    // Validate categories
    const validCategories = await Category.find({ _id: { $in: incomingCategories } });
    const categoryIds = validCategories.map(c => c._id);

    // Upload image if provided
    let coverImageUrl = "";
    if (req.file) {
      const uploadRes = await uploadToCloudinary(req.file.buffer);
      coverImageUrl = uploadRes.secure_url;
    }

    // ✅ Include publishedAt field
    const post = await Post.create({
      title,
      content,
      status,
      categories: categoryIds,
      tags: tagArray,
      coverImageUrl,
      author: req.user._id,
      publishedAt: status === "published" ? new Date() : null,
    });

    res.status(201).json(await post.populate("categories", "name slug"));
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Failed to create post" });
  }
}

// ✅ Get all posts (with filters + pagination)
async function getPosts(req, res) {
  try {
    const { search, category, tag, author, status, page = 1, limit = 10 } = req.query;
    const baseQuery = {};

    // Default to only published posts unless status is explicitly specified
    if (status) {
      baseQuery.status = status;
    } else {
      baseQuery.status = "published";
    }
    
    if (author) baseQuery.author = author;
    if (tag) baseQuery.tags = tag;

    // Category filter
    if (category) {
      const catDoc = await Category.findOne({ slug: category.toLowerCase() });
      if (catDoc) {
        baseQuery.categories = catDoc._id;
      } else {
        return res.json({ items: [], total: 0, page: 1, pages: 0 });
      }
    }

    // Search filter
    let finalQuery = baseQuery;
    if (search) {
      const searchOr = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ],
      };

      if (Object.keys(baseQuery).length > 0) {
        finalQuery = { $and: [baseQuery, searchOr] };
      } else {
        finalQuery = searchOr;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Post.find(finalQuery)
        .populate("author", "username")
        .populate("categories", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Post.countDocuments(finalQuery),
    ]);

    res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
}

// ✅ Get logged-in user's posts (including drafts)
async function getMyPosts(req, res) {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate('author', 'username')
      .populate('categories', 'name slug')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Get my posts error:", error);
    res.status(500).json({ message: "Failed to fetch your posts" });
  }
}

// ✅ Get single post by ID
async function getPostById(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("author", "username _id")
      .populate("categories", "name slug");

    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Failed to fetch post" });
  }
}

// ✅ Update Post
async function updatePost(req, res) {
  try {
    let { title, content, status, categories, tags } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (status !== undefined) {
      post.status = status;
      post.publishedAt =
        status === "published" ? post.publishedAt || new Date() : null;
    }

    if (categories !== undefined) {
      const incomingCategories = Array.isArray(categories)
        ? categories
        : categories
        ? [categories]
        : [];
      const validCategories = await Category.find({ _id: { $in: incomingCategories } });
      post.categories = validCategories.map(c => c._id);
    }

    if (tags !== undefined) post.tags = safeParseJSON(tags);

    if (req.file) {
      const uploadRes = await uploadToCloudinary(req.file.buffer);
      post.coverImageUrl = uploadRes.secure_url;
    }

    await post.save();
    res.json(await post.populate("categories", "name slug"));
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ message: "Failed to update post" });
  }
}

// ✅ Delete Post
async function deletePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await post.deleteOne();
    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Failed to delete post" });
  }
}

// ✅ Toggle Like
async function toggleLike(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id.toString();
    const idx = post.likes.findIndex((u) => u.toString() === userId);
    let liked;

    if (idx >= 0) {
      post.likes.splice(idx, 1);
      liked = false;
    } else {
      post.likes.push(req.user._id);
      liked = true;
    }

    await post.save();
    res.json({ likesCount: post.likes.length, liked });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ message: "Failed to toggle like" });
  }
}

// ✅ Toggle Bookmark
async function toggleBookmark(req, res) {
  try {
    const postId = req.params.id;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const idx = user.bookmarks.findIndex((p) => p.toString() === postId);
    let bookmarked;

    if (idx >= 0) {
      user.bookmarks.splice(idx, 1);
      bookmarked = false;
    } else {
      user.bookmarks.push(postId);
      bookmarked = true;
    }

    await user.save();
    res.json({
      bookmarks: user.bookmarks.map((b) => b.toString()),
      bookmarked,
    });
  } catch (error) {
    console.error("Toggle bookmark error:", error);
    res.status(500).json({ message: "Failed to toggle bookmark" });
  }
}

module.exports = {
  createPost,
  getPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  toggleBookmark,
};

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Trash2, ThumbsUp } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "https://blog-v8hp.onrender.com";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/posts/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setPost(data);
        setLikes(data.likes?.length || 0);
        setIsLiked(user && data.likes?.includes(user._id));
      } catch (err) {
        console.error("Failed to load post:", err);
      }
    };
    fetchPost();
  }, [id, user]);

  // Fetch comments
  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/comments/post/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  // Handle Like / Unlike
  const toggleLike = async () => {
    if (!user) {
      alert("Please log in to like posts.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/posts/${id}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likesCount);
        setIsLiked(data.isLiked);
      }
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  // Handle new comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to comment.");
      return;
    }
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/comments/post/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        setNewComment("");
        fetchComments(); // Refresh comments after posting
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  if (!post) return <div className="p-6 text-center text-gray-600">Loading post...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6">
      {/* Post Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-3 leading-tight">
        {post.title}
      </h1>

      {/* Author & Date */}
      <div className="text-sm text-gray-500 mb-6">
        By <span className="font-semibold">{post.author?.username}</span> •{" "}
        {new Date(post.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>

      {/* Post Image */}
      {(post.image || post.coverImageUrl) && (
        <img
          src={post.image || post.coverImageUrl}
          alt={post.title}
          className="w-full rounded-xl mb-8 shadow-sm"
        />
      )}

      {/* Post Content (formatted with paragraph breaks) */}
      <div className="prose max-w-none text-gray-700 mb-8 leading-relaxed space-y-5">
        {post.content
          ?.split(/\n+/)
          .filter((para) => para.trim() !== "")
          .map((para, index) => (
            <p key={index}>{para}</p>
          ))}
      </div>

      {/* Like Section */}
      <div className="flex items-center gap-3 mb-10">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-2 px-3 py-2 rounded-full border transition ${
            isLiked
              ? "bg-blue-600 text-white border-blue-600"
              : "text-gray-600 border-gray-300 hover:bg-gray-100"
          }`}
        >
          <ThumbsUp size={18} />
          <span>{likes}</span>
        </button>
      </div>

      {/* Comment Section */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Comments ({comments.length})
        </h2>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <button
              type="submit"
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Post Comment
            </button>
          </form>
        ) : (
          <p className="text-gray-500 mb-6">Login to leave a comment.</p>
        )}

        {/* Display Comments */}
        <div className="space-y-4">
          {comments.length === 0 && (
            <p className="text-gray-500">No comments yet. Be the first!</p>
          )}

          {comments.map((comment) => (
            <div
              key={comment._id}
              className="border border-gray-200 p-4 rounded-lg flex justify-between items-start"
            >
              <div>
                <p className="text-gray-800 mb-1">{comment.content}</p>
                <p className="text-sm text-gray-500">
                  {comment.author?.username || "Anonymous"} •{" "}
                  {new Date(comment.createdAt).toLocaleDateString("en-US")}

                </p>
              </div>

              {user && user._id === comment.author?._id && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete comment"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

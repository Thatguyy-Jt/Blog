import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from '../components/Spinner.jsx'
import { toast } from '../components/Toaster.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || ''

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchPosts()
  }, [user, navigate, page])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/posts/mine?page=${page}&limit=6`, { 
        credentials: 'include' 
      })
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
        setTotalPages(data.pages || 1)
      } else {
        setPosts([])
      }
    } catch (err) {
      console.error("Failed to fetch user posts:", err)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleNew = () => navigate('/posts/new')

  // FIX: Navigate to the correct edit route for the EditPost component
  const handleEdit = (id) => navigate(`/posts/${id}/edit`) 

  const handleDelete = async (id) => {
    if (!confirm('Delete this post? This action cannot be undone.')) return
    
    // Optimistic UI update
    const originalPosts = posts;
    setPosts((p) => p.filter(x => x._id !== id));
    
    const res = await fetch(`${API_BASE}/api/posts/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    
    if (res.ok) {
      toast('Post deleted successfully.')
    } else {
      toast('Failed to delete post.')
      // Revert state if the API call fails
      setPosts(originalPosts); 
    }
  }

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      const res = await fetch(`${API_BASE}/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        // Update the post status in the UI
        setPosts(prev => prev.map(p => 
          p._id === id ? { ...p, status: newStatus } : p
        ));
        toast(`Post ${newStatus === 'published' ? 'published' : 'moved to draft'}.`);
      } else {
        toast('Failed to update post status.');
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      toast('Failed to update post status.');
    }
  }

  if (loading) return <div className="flex justify-center pt-20"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold">Your Dashboard</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Create posts, upload images, and manage your content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Create card */}
        <div className="rounded-2xl border border-gray-200 p-4 sm:p-6 bg-white shadow-sm">
          <h3 className="font-semibold mb-3 text-lg">Quick Create</h3>
          <p className="text-sm text-gray-500 mb-4">Click New Post to open the composer and publish instantly.</p>
          <button 
            onClick={handleNew} 
            className="w-full sm:w-auto rounded-lg bg-indigo-600 text-white px-4 py-3 hover:bg-indigo-700 transition font-medium"
          >
            Create new post
          </button>
        </div>

        {/* Posts list */}
        <div className="lg:col-span-1 rounded-2xl border border-gray-200 p-4 sm:p-6 bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <h3 className="font-semibold text-lg">Your posts</h3>
            {totalPages > 1 && (
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
            )}
          </div>
          {posts.length === 0 ? (
            <div className="text-gray-500">No posts yet — start by creating a new post.</div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-gray-50/50">
                  {/* Mobile-first layout */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {/* Image */}
                    <Link to={`/posts/${post._id}`} className="h-20 w-full sm:h-16 sm:w-24 flex-shrink-0">
                      <img 
                        src={post.coverImageUrl || '/placeholder.png'} 
                        alt="" 
                        className="h-full w-full object-cover rounded-md" 
                      />
                    </Link>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-2">
                        <Link 
                          to={`/posts/${post._id}`} 
                          className="font-medium hover:text-indigo-600 transition text-sm sm:text-base line-clamp-1"
                        >
                          {post.title}
                        </Link>
                        <span className={`px-2 py-1 text-xs rounded-full self-start ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-2 mb-2">{post.content}</div>
                      <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  {/* Action buttons - mobile optimized */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                    <button 
                      onClick={() => handleEdit(post._id)} 
                      className="flex-1 sm:flex-none text-xs sm:text-sm px-3 py-2 rounded-md border border-indigo-500 text-indigo-500 hover:bg-indigo-50 transition font-medium"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(post._id, post.status)} 
                      className={`flex-1 sm:flex-none text-xs sm:text-sm px-3 py-2 rounded-md transition font-medium ${
                        post.status === 'published'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {post.status === 'published' ? 'Draft' : 'Publish'}
                    </button>
                    <button 
                      onClick={() => handleDelete(post._id)} 
                      className="flex-1 sm:flex-none text-xs sm:text-sm px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border-gray-300'
                }`}
              >
                ← Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm font-medium">
                  Page {page} of {totalPages}
                </span>
              </div>

              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className={`w-full sm:w-auto px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  page === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border-gray-300'
                }`}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
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

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    // Fetch posts belonging to the logged-in user
    fetch(`${API_BASE}/api/posts/mine`, { credentials: 'include' }) 
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setPosts(data))
      .catch((err) => {
        console.error("Failed to fetch user posts:", err);
        setPosts([])
      })
      .finally(() => setLoading(false))
  }, [user, navigate])

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

  if (loading) return <div className="flex justify-center pt-20"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">Your Dashboard</h1>
          <p className="text-gray-600 mt-1">Create posts, upload images, and manage your content.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create card */}
        <div className="rounded-2xl border border-gray-200 p-6 bg-white shadow-sm">
          <h3 className="font-semibold mb-3">Quick Create</h3>
          <p className="text-sm text-gray-500 mb-4">Click New Post to open the composer and publish instantly.</p>
          <button onClick={handleNew} className="mt-2 rounded-md bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 transition">Create new post</button>
        </div>

        {/* Posts list */}
        <div className="col-span-1 md:col-span-1 rounded-2xl border border-gray-200 p-6 bg-white shadow-sm">
          <h3 className="font-semibold mb-4">Your posts</h3>
          {posts.length === 0 ? (
            <div className="text-gray-500">No posts yet — start by creating a new post.</div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post._id} className="flex items-center gap-4 p-3 rounded-lg border hover:shadow-md transition-fast">
                  {/* Link to post detail page */}
                  <Link to={`/posts/${post._id}`} className="h-16 w-24 flex-shrink-0">
                    <img src={post.coverImageUrl || '/placeholder.png'} alt="" className="h-full w-full object-cover rounded-md" />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/posts/${post._id}`} className="font-medium hover:text-indigo-600 transition">{post.title}</Link>
                    <div className="text-sm text-gray-500 line-clamp-2">{post.content}</div>
                    <div className="mt-2 text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleEdit(post._id)} 
                      className="text-sm px-3 py-1 rounded-md border border-indigo-500 text-indigo-500 hover:bg-indigo-50 transition"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(post._id)} 
                      className="text-sm px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
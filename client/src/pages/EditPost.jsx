import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { toast } from '../components/Toaster.jsx'
import Spinner from '../components/Spinner.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function EditPost() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { postId } = useParams() // Get the ID from the URL

  // State for form fields
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('draft')
  const [selectedCats, setSelectedCats] = useState([]) // Array of selected Category IDs
  const [tags, setTags] = useState('')
  const [imageFile, setImageFile] = useState(null)
  
  // State for UI/API
  const [loading, setLoading] = useState(false)
  const [isFetchingPost, setIsFetchingPost] = useState(true) 
  const [preview, setPreview] = useState(null)
  const [allCategories, setAllCategories] = useState([]) // Array of all available categories
  const [existingImageUrl, setExistingImageUrl] = useState(null) 

  // 1. Load All Categories (runs once)
  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then((r) => r.json())
      .then(setAllCategories)
      .catch((err) => {
        console.error('Failed to load categories', err)
        toast('Failed to load categories')
      })
  }, [])

  // 2. Load Existing Post Data (to pre-fill the form)
  useEffect(() => {
    setIsFetchingPost(true)
    fetch(`${API_BASE}/api/posts/${postId}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Post not found or unauthorized.')
        }
        const post = await res.json()
        
        // Populate state with existing data
        setTitle(post.title || '')
        setContent(post.content || '')
        setStatus(post.status || 'draft')
        
        // FIX: Pre-select categories by mapping the post's categories array to an array of IDs
        // Post categories are usually populated, so we extract the ID from the object.
        setSelectedCats((post.categories || []).map(c => c._id)) 
        
        setTags((post.tags || []).join(', '))
        setExistingImageUrl(post.coverImageUrl)
      })
      .catch((err) => {
        console.error(err)
        toast('Failed to load post data: ' + err.message)
        navigate('/dashboard') 
      })
      .finally(() => setIsFetchingPost(false))
  }, [postId, navigate])

  // 3. Image Preview Effect
  useEffect(() => {
    if (!imageFile) { setPreview(null); return }
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(imageFile)
    return () => reader.abort && reader.abort()
  }, [imageFile])

  if (!user) return <div className="text-center py-20">You must be logged in to edit a post.</div>
  
  if (isFetchingPost) return <div className="flex justify-center pt-20"><Spinner /></div>

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      return toast('Title and content are required.')
    }

    try {
      setLoading(true)
      const form = new FormData()
      form.append('title', title)
      form.append('content', content)
      form.append('status', status)
      
      // Submit the updated array of selected Category IDs
      selectedCats.forEach(catId => {
        form.append('categories', catId)
      })
      
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean)
      tagArray.forEach(tag => {
        form.append('tags', tag)
      })
      
      if (imageFile) form.append('image', imageFile)

      const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
        method: 'PUT', // Always PUT for update
        credentials: 'include',
        body: form,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to update post')
      }

      const post = await res.json()
      toast('Post updated')
      navigate(`/posts/${post._id}`)
    } catch (e) {
      console.error(e)
      toast(e.message || 'Failed to update post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Edit Existing Post</h1>
        <p className="text-gray-600">Update your content, categories, and cover image.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-3xl p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            className="w-full rounded-xl border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            required
            disabled={loading}
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="10"
            placeholder="Write your story..."
            className="w-full rounded-2xl border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition resize-none"
            required
            disabled={loading}
          ></textarea>
        </div>

        {/* Status & Tags */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              disabled={loading}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Tags (Comma-separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="design, tech, news..."
              className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              disabled={loading}
            />
          </div>
        </div>

        {/* ✅ CATEGORIES SELECTION */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Categories (Select one or more)</label>
          <div className="flex flex-wrap gap-3">
            {allCategories.length === 0 ? (
                <p className="text-gray-500 text-sm">No categories available. Contact admin to create them.</p>
            ) : (
                allCategories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    // Toggles the category ID in the selectedCats array
                    onClick={() =>
                      setSelectedCats((prev) => (prev.includes(cat._id) ? prev.filter((c) => c !== cat._id) : [...prev, cat._id]))
                    }
                    className={`px-4 py-2 rounded-full border transition ${
                      selectedCats.includes(cat._id)
                        ? 'bg-gradient-to-r from-indigo-500 to-rose-500 text-white border-transparent shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:shadow-lg hover:bg-gray-50'
                    }`}
                    disabled={loading}
                  >
                    {cat.name}
                  </button>
                ))
            )}
          </div>
        </div>


        {/* Feature image */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Feature Image</label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border px-4 py-2 hover:bg-gray-50 transition">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              <span className="text-sm font-medium">Choose New Image</span>
            </label>
            {(preview || existingImageUrl) ? (
                <img 
                    src={preview || existingImageUrl} 
                    alt="Current cover" 
                    className="h-24 w-40 object-cover rounded-xl border shadow-sm" 
                />
            ) : (
                <div className="text-sm text-gray-400">No image selected</div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="text-right">
          <button type="submit" disabled={loading} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-50">
            {loading ? <span className="inline-flex items-center gap-2"><Spinner /> Updating...</span> : 'Update Post'}
          </button>
        </div>
      </form>
    </div>
  )
}
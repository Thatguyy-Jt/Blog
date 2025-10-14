// --- pages/CategoryManager.jsx ---
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { toast } from '../components/Toaster.jsx'
import Spinner from '../components/Spinner.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://blog-v8hp.onrender.com'

export default function CategoryManager() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(null) // ID of category being edited
  
  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = () => {
    setLoading(true)
    fetch(`${API_BASE}/api/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(err => {
        console.error("Failed to fetch categories:", err)
        toast("Failed to load categories")
      })
      .finally(() => setLoading(false))
  }

  const resetForm = () => {
    setName('')
    setSlug('')
    setDescription('')
    setIsEditing(null)
  }

  const handleEditClick = (category) => {
    setIsEditing(category._id)
    setName(category.name)
    setSlug(category.slug)
    setDescription(category.description)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) {
      return toast("Name and slug are required.")
    }
    
    // Check if the user is an admin (required by your router)
    if (user?.role !== 'admin') {
        return toast("You must be an admin to manage categories.")
    }

    setIsSubmitting(true)
    
    const method = isEditing ? 'PUT' : 'POST'
    const url = isEditing ? `${API_BASE}/api/categories/${isEditing}` : `${API_BASE}/api/categories`
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, slug, description }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `Failed to ${isEditing ? 'update' : 'create'} category`)
      }

      toast(`Category ${isEditing ? 'updated' : 'created'}.`)
      resetForm()
      fetchCategories() // Refresh the list
    } catch (e) {
      console.error(e)
      toast(e.message || "An error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    if (user?.role !== 'admin') {
        return toast("You must be an admin to delete categories.")
    }
    
    // Optimistic UI update
    setCategories(prev => prev.filter(c => c._id !== id))
    
    try {
      const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        toast("Category deleted.")
      } else {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to delete category.")
      }
    } catch (e) {
      console.error(e)
      toast(e.message || "Error deleting category.")
      fetchCategories() // Re-fetch on error
    }
  }

  // Restrict access if not logged in or not admin (basic client-side protection)
  if (!user || user.role !== 'admin') {
    return <div className="text-center py-20 text-red-600">Access Denied: You must be an administrator to manage categories.</div>
  }

  if (loading && categories.length === 0) return <div className="flex justify-center pt-20"><Spinner /></div>

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-extrabold mb-8">Category Manager</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Category Form (Create/Edit) */}
        <div className="md:col-span-1 bg-white p-6 shadow-xl rounded-2xl h-fit">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
            {isEditing ? 'Edit Category' : 'Create New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Technology"
                className="w-full rounded-lg border border-gray-300 p-2 mt-1"
                disabled={isSubmitting}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug (URL handle)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="e.g., technology"
                className="w-full rounded-lg border border-gray-300 p-2 mt-1"
                disabled={isSubmitting}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full rounded-lg border border-gray-300 p-2 mt-1 resize-none"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                {isEditing && (
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 transition"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Spinner size="sm" /> : isEditing ? 'Update Category' : 'Create Category'}
                </button>
            </div>
          </form>
        </div>

        {/* Category List */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Existing Categories ({categories.length})</h2>
          {categories.length === 0 ? (
            <div className="text-gray-500 py-10 text-center border-2 border-dashed rounded-xl">No categories found. Use the form to create one.</div>
          ) : (
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat._id} className="bg-gray-50 p-4 rounded-xl shadow-sm flex justify-between items-center border">
                  <div>
                    <div className="font-bold text-gray-800">{cat.name}</div>
                    <div className="text-sm text-indigo-600">Slug: {cat.slug}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{cat.description}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(cat)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 transition p-2 rounded-full hover:bg-indigo-50"
                      title="Edit"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-sm text-red-600 hover:text-red-800 transition p-2 rounded-full hover:bg-red-50"
                      title="Delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
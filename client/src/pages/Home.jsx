import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner.jsx';
import { ChevronDown } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://blog-v8hp.onrender.com';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1); // current page
  const [totalPages, setTotalPages] = useState(1); // total pages

  const limit = 6; // posts per page

  const fetchPosts = useCallback(
    async (categoryId, pageNum = 1) => {
      const queryParams = new URLSearchParams({ page: pageNum, limit });
      let categorySlug = null;

      if (categoryId) {
        const cat = categories.find((c) => c._id === categoryId);
        if (cat && cat.slug) {
          categorySlug = cat.slug;
          queryParams.append('category', categorySlug);
        }
      }

      const url = `${API_BASE}/api/posts?${queryParams.toString()}`;
      setLoading(true);

      try {
        const res = await fetch(url);
        const data = await res.json();

        setPosts(data.items || data.posts || []);
        setTotalPages(data.totalPages || Math.ceil((data.total || 0) / limit) || 1);
      } catch (err) {
        console.error('Failed to load posts', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    },
    [categories]
  );

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then((r) => r.json())
      .then(setCategories)
      .catch((err) => {
        console.error('Failed to load categories', err);
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    if (categories.length > 0 || selectedCategory === '') {
      fetchPosts(selectedCategory, page);
    }
  }, [selectedCategory, categories, page, fetchPosts]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1); // reset to first page when changing category
  };

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  if (loading && posts.length === 0)
    return (
      <div className="flex justify-center pt-32 min-h-screen bg-gray-50">
        <Spinner />
      </div>
    );

  return (
    <div className="bg-gray-50">
      {/* ✅ HERO SECTION WITH ROUNDED EDGES */}
      <section className="relative w-full bg-gray-900 text-white overflow-hidden rounded-3xl shadow-xl mx-auto max-w-screen-xl mt-8">
        <div
          className="absolute inset-0 opacity-10 bg-repeat rounded-5xl"
          style={{
            backgroundImage: 'radial-gradient(rgb(31 41 55) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative px-6 py-20 sm:px-10 md:px-16 md:py-28 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            The World's Best Stories
          </h1>
          <p className="mt-4 mx-auto max-w-3xl text-gray-400 text-lg">
            Dive into a curated collection of deep dives, tutorials, and insights. Filter by category to find your next great read.
          </p>

          <div className="mt-8 flex justify-center relative">
            <div className="relative w-full max-w-sm">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full appearance-none rounded-xl bg-gray-800 text-white p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700 transition pr-10 cursor-pointer"
                disabled={loading}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ✅ MAIN CONTENT */}
      <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-2">
          Latest Posts
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-20 bg-white rounded-xl shadow-lg border border-gray-100">
              <p className="text-xl font-medium">No posts found in this selection.</p>
              <p className="mt-2 text-sm">Try selecting "All Categories" or check back later.</p>
            </div>
          ) : (
            posts.map((p) => (
              <Link
                key={p._id}
                to={`/posts/${p._id}`}
                className="block rounded-xl bg-white shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:border-indigo-200 transition duration-300 group"
              >
                {p.coverImageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={p.coverImageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-in-out"
                    />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(p.categories || []).slice(0, 2).map((cat) => {
                      const name =
                        typeof cat === 'string'
                          ? categories.find((c) => c._id === cat)?.name || 'Unknown'
                          : cat.name || 'Unknown';
                      return (
                        <span
                          key={cat._id || cat}
                          className="rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-medium"
                        >
                          {name}
                        </span>
                      );
                    })}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition duration-200 line-clamp-2">
                    {p.title}
                  </h3>

                  <p className="mt-2 text-base text-gray-600 line-clamp-3">
                    {p.summary || (p.content ? p.content.substring(0, 150) + '...' : '')}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                    <span className="font-medium text-gray-700">
                      {p.author?.username ?? 'Unknown Author'}
                    </span>
                    <span>
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : ''}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* ✅ PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border-gray-300'
              }`}
            >
              Previous
            </button>

            <span className="text-gray-700 text-sm font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                page === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

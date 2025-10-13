import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner.jsx';
// Assuming a clean icon library for visual flair
import { ChevronDown, BookOpenText } from 'lucide-react'; 

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');

    const fetchPosts = useCallback(async (categoryId) => {
        const queryParams = new URLSearchParams();
        let categorySlug = null;

        // Find the category slug to use in the API call
        if (categoryId) {
            const cat = categories.find(c => c._id === categoryId);
            if (cat && cat.slug) {
                categorySlug = cat.slug;
                queryParams.append('category', categorySlug);
            }
        }

        const url = `${API_BASE}/api/posts?${queryParams.toString()}`;
        setLoading(true);
        try {
            const r = await fetch(url);
            const d = await r.json();
            setPosts(d.items || d || []);
        } catch (err) {
            console.error('Failed to load posts', err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [categories]);

    // Fetch categories on mount
    useEffect(() => {
        fetch(`${API_BASE}/api/categories`)
            .then(r => r.json())
            .then(setCategories)
            .catch(err => {
                console.error('Failed to load categories', err);
                setCategories([]);
            });
    }, []);

    // Fetch posts whenever selectedCategory or categories change
    useEffect(() => {
        // Ensure categories are loaded before attempting to filter by slug
        if (categories.length > 0 || selectedCategory === '') {
            fetchPosts(selectedCategory);
        }
    }, [selectedCategory, categories, fetchPosts]);

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    // Show initial loading spinner when no posts are loaded yet
    if (loading && posts.length === 0) return (
        <div className="flex justify-center pt-32 min-h-screen bg-gray-50"><Spinner /></div>
    );

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-12">
            {/* Hero Section - Dark, Sleek, and Professional */}
            <section className="relative overflow-hidden rounded-3xl bg-gray-900 text-white shadow-xl">
                {/* Subtle background texture for depth */}
                <div className="absolute inset-0 opacity-10 bg-repeat" 
                     style={{ backgroundImage: 'radial-gradient(rgb(31 41 55) 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                />
                
                <div className="relative px-6 py-20 sm:px-10 md:px-16 md:py-28 text-center">
                    {/* <BookOpenText className="h-10 w-10 text-indigo-400 mx-auto mb-4" /> */}
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        The World's Best Stories
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-gray-400 text-lg">
                        Dive into a curated collection of deep dives, tutorials, and insights. Filter by category to find your next great read.
                    </p>
                    
                    {/* Category Filter - Integrated and Styled */}
                    <div className="mt-8 flex justify-center relative">
                        <select
                            value={selectedCategory}
                            onChange={handleCategoryChange} 
                            // Sleek dark-mode select styling
                            className="w-full max-w-sm appearance-none rounded-xl bg-gray-800 text-white p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700 transition pr-10 cursor-pointer" 
                            disabled={loading}
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                        {/* <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" /> */}
                    </div>
                </div>
            </section>

            {/* Posts Grid - Clean, Magazine Layout */}
            <section className="mt-12">
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
                                // Post Card Style: White background, subtle shadow, great hover effect
                                className="block rounded-xl bg-white shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:border-indigo-200 transition duration-300 group"
                            >
                                {p.coverImageUrl && (
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={p.coverImageUrl}
                                            alt={p.title}
                                            // Image hover effect for a dynamic feel
                                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-in-out"
                                        />
                                    </div>
                                )}
                                
                                <div className="p-5">
                                    {/* Category Tags - Clean and primary-colored */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {(p.categories || []).slice(0, 2).map((cat) => {
                                            const name = typeof cat === 'string'
                                                ? (categories.find(c => c._id === cat)?.name || 'Unknown')
                                                : (cat.name || 'Unknown');
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

                                    {/* Title - Bold and attention-grabbing */}
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition duration-200 line-clamp-2">
                                        {p.title}
                                    </h3>

                                    {/* Summary/Content Snippet */}
                                    <p className="mt-2 text-base text-gray-600 line-clamp-3">
                                        {/* Fallback to a slice of content if summary is missing */}
                                        {p.summary || (p.content ? p.content.substring(0, 150) + '...' : '')}
                                    </p>

                                    {/* Meta Data */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                                        <span className="font-medium text-gray-700">
                                            {p.author?.username ?? 'Unknown Author'}
                                        </span>
                                        <span>
                                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
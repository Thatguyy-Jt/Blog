import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useState } from 'react' // We need useState for the mobile menu state

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  // State to manage the open/close status of the mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }
  
  // Helper to close the menu after navigation
  const closeMenu = () => setIsMenuOpen(false);

  // Helper for regular NavLink classes
  const linkClass = (isActive) =>
    isActive ? 'text-accent font-semibold' : 'text-gray-600 hover:text-gray-900 transition-fast';
    
  // Helper for Admin NavLink classes (to make it stand out)
  const adminLinkClass = (isActive) => 
    isActive ? 'text-rose-600 font-semibold' : 'text-gray-600 hover:text-gray-900 transition-fast';

  return (
    <header className="border-b border-gray-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
      <div className="container-responsive py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-xl font-semibold tracking-tight" onClick={closeMenu}>
          <span className="text-primary">Modern</span>
          <span className="text-accent">Blog</span>
        </Link>
        
        {/* Mobile Menu Button (Hamburger) */}
        <button 
          className="sm:hidden p-2 text-gray-600 hover:text-gray-900"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {/* Toggle between hamburger and X icon */}
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden sm:flex items-center gap-4">
          <NavLink to="/" className={({ isActive }) => linkClass(isActive)}>
            Home
          </NavLink>

          {user ? (
            <div className="flex items-center gap-4">
                
                {/* Admin Link (Desktop) */}
                {user.role === 'admin' && (
                    <NavLink to="/admin/categories" className={({ isActive }) => adminLinkClass(isActive)}>
                        Admin Categories
                    </NavLink>
                )}
                
              <NavLink to="/dashboard" className={({ isActive }) => linkClass(isActive)}>
                Dashboard
              </NavLink>
              <NavLink to="/posts/new" className={({ isActive }) => linkClass(isActive)}>
                New Post
              </NavLink>
              <span className="hidden sm:inline text-gray-500">{user.username}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md bg-accent text-white hover:opacity-90 transition-fast"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 transition-fast"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="px-3 py-1.5 rounded-md bg-accent text-white hover:opacity-90 transition-fast"
              >
                Sign up
              </NavLink>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile Menu Content (Visible only when isMenuOpen is true) */}
      {isMenuOpen && (
        <div id="mobile-menu" className="sm:hidden absolute w-full bg-white/95 backdrop-blur border-b border-gray-200 shadow-xl pb-4 animate-in fade-in slide-in-from-top-1">
          <nav className="flex flex-col px-6 py-2 gap-1">
            
            <NavLink to="/" onClick={closeMenu} className={({ isActive }) => `block py-2 text-base ${linkClass(isActive)}`}>Home</NavLink>

            {user ? (
              <>
                {/* Admin Link (Mobile) */}
                {user.role === 'admin' && (
                    <NavLink to="/admin/categories" onClick={closeMenu} className={({ isActive }) => `block py-2 text-base ${adminLinkClass(isActive)}`}>
                        Admin Categories
                    </NavLink>
                )}
                
                <NavLink to="/dashboard" onClick={closeMenu} className={({ isActive }) => `block py-2 text-base ${linkClass(isActive)}`}>Dashboard</NavLink>
                <NavLink to="/posts/new" onClick={closeMenu} className={`block py-2 text-base ${linkClass(false)}`}>New Post</NavLink>
                
                {/* Logout Button in Mobile Menu */}
                <div className="pt-4 border-t border-gray-100 mt-2">
                    <button
                        onClick={() => { handleLogout(); closeMenu(); }}
                        className="w-full text-center px-3 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-fast"
                    >
                        Logout ({user.username})
                    </button>
                </div>
              </>
            ) : (
              // Login/Register in Mobile Menu
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 mt-2">
                <NavLink to="/login" onClick={closeMenu} className="text-center px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-fast">
                    Login
                </NavLink>
                <NavLink to="/register" onClick={closeMenu} className="text-center px-3 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-fast">
                    Sign up
                </NavLink>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
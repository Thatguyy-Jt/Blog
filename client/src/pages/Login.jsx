import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from '../components/Toaster.jsx';
import Spinner from '../components/Spinner.jsx';
// Assuming you have 'lucide-react' or similar icon library for a cleaner look
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'; 

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      toast('Welcome back!');
      // Navigate to the intended page, falling back to '/'
      const from = location.state?.from?.pathname || '/'; 
      navigate(from, { replace: true });
    } catch (e) {
      toast('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Clean background and guaranteed center alignment without scroll (h-screen, overflow-hidden)
    <div className="h-screen flex items-center justify-center p-4 bg-gray-50 overflow-hidden">
      
      {/* Visual Accent Layer: Subtle, geometric pattern in the background */}
      <div className="absolute inset-0 bg-repeat opacity-5" 
           style={{ backgroundImage: 'radial-gradient(#e0e7ff 1px, transparent 1px)' }} 
      />
      
      {/* Login Card - Clean, Elevated, and Modern */}
      <div className="z-10 w-full max-w-sm rounded-xl bg-white p-10 shadow-2xl transition-all duration-300 hover:shadow-indigo-300/50 border border-gray-100">
        
        {/* Header Section */}
        <div className="text-center">
            <Lock className="h-8 w-8 text-indigo-600 mx-auto" aria-hidden="true" />
            <h2 className="mt-4 text-3xl font-bold text-gray-900">
                Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-500">
                Welcome back! Let's get you logged in.
            </p>
        </div>

        {/* Form Section */}
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          
          {/* Email Input Field */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email Address"
              required
              // Cleaner input style with padding for icon and a focus ring
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
          </div>

          {/* Password Input Field with Toggle */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              required
              className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
            {/* Show/Hide Button using icons */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 p-1 transition"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Submit Button - Solid primary color with soft shadow */}
          <button
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 text-white font-semibold py-3 hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 disabled:bg-indigo-400"
          >
            {loading && <Spinner />} 
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer/Navigation Link */}
        <p className="mt-6 text-sm text-center text-gray-500">
          No account?{' '}
          <Link 
            className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline transition" 
            to="/register"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
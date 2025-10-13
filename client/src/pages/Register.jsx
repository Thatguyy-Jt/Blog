import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from '../components/Toaster.jsx';
import Spinner from '../components/Spinner.jsx';
// Assuming you have 'lucide-react' or similar icon library
import { User, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react'; 

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Basic client-side validation for a better user experience
      if (username.length < 3) {
        toast('Username must be at least 3 characters long.');
        setLoading(false);
        return;
      }

      await register(username, email, password);
      toast('Registration successful! Welcome!');
      navigate('/dashboard');
    } catch (e) {
      // You might want to parse the error 'e' to provide a more specific message
      toast('Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Clean background and guaranteed center alignment without scroll
    <div className="h-screen flex items-center justify-center p-4 bg-gray-50 overflow-hidden">
      
      {/* Visual Accent Layer: Subtle background pattern for texture */}
      <div className="absolute inset-0 bg-repeat opacity-5" 
           style={{ backgroundImage: 'radial-gradient(#f3e8ff 1px, transparent 1px)' }} 
      />
      
      {/* Registration Card - Clean, Elevated, and Modern */}
      <div className="z-10 w-full max-w-sm rounded-xl bg-white p-10 shadow-2xl transition-all duration-300 hover:shadow-purple-300/50 border border-gray-100">
        
        {/* Header Section */}
        <div className="text-center">
            <Sparkles className="h-8 w-8 text-purple-600 mx-auto" aria-hidden="true" />
            <h2 className="mt-4 text-3xl font-bold text-gray-900">
                Create Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-500">
                Join the community and get started!
            </p>
        </div>

        {/* Form Section */}
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          
          {/* Username Input Field */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username (min 3 characters)"
              required
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
            />
          </div>
          
          {/* Email Input Field */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email Address"
              required
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
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
              className="w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
            />
            {/* Show/Hide Button using icons */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 p-1 transition"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Submit Button - Solid primary color with soft shadow */}
          <button
            disabled={loading}
            // Using a single, clean Purple color for the button for consistency
            className="w-full rounded-lg bg-purple-600 text-white font-semibold py-3 hover:bg-purple-700 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 disabled:bg-purple-400"
          >
            {loading && <Spinner />} 
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Footer/Navigation Link */}
        <p className="mt-6 text-sm text-center text-gray-500">
          Already have an account?{' '}
          <Link 
            className="text-purple-600 font-medium hover:text-purple-700 hover:underline transition" 
            to="/login"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
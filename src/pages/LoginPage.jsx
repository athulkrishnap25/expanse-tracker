import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { signInWithGoogle } from '../firebase/authService'; // Service for Google Sign-In
import Spinner from '../components/ui/Spinner';
import { FiMail, FiLock } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';

const LoginPage = () => {
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State for handling errors and loading feedback
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Hook to redirect user after login
  const navigate = useNavigate();

  // --- HANDLERS ---

  // Handles traditional email & password sign-in
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple clicks
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to dashboard on success
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      setLoading(false); // Reset loading state on error
    }
  };

  // Handles the "Sign in with Google" button click
  const handleGoogleSignIn = async () => {
    if (googleLoading) return;
    setError('');
    setGoogleLoading(true);
    
    const user = await signInWithGoogle();
    if (user) {
      navigate('/'); // Redirect on successful sign-in
    } else {
      setError('Could not complete sign-in with Google. Please try again.');
      setGoogleLoading(false); // Reset loading state on error
    }
  };

  // --- JSX RENDER ---

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800/30 backdrop-blur-lg rounded-2xl shadow-2xl animate-fade-in-up">
        
        {/* Header Section with Logo and Welcome Text */}
        <div className="flex flex-col items-center text-center">
          <img 
            src="https://cdn.dribbble.com/userupload/26311651/file/original-9b8ef43ee60ecbb525d83f1853c46cb0.jpg?resize=1504x1128&vertical=center" // <-- PASTE YOUR IMAGE URL HERE
            alt="Shop Logo" 
            className="w-16 h-16 mb-4 rounded-full" 
          />
          <h2 className="mt-2 text-3xl font-extrabold text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-400">Shadozz Admin Login</p>
        </div>

        {/* Email & Password Login Form */}
        <form className="space-y-6" onSubmit={handleEmailLogin}>
          {/* Email Input with Icon */}
          <div className="relative">
            <FiMail className="absolute w-5 h-5 text-gray-400 top-3 left-3" />
            <input
              type="email"
              required
              className="w-full py-2 pl-10 pr-4 text-white bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input with Icon */}
          <div className="relative">
            <FiLock className="absolute w-5 h-5 text-gray-400 top-3 left-3" />
            <input
              type="password"
              required
              className="w-full py-2 pl-10 pr-4 text-white bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-end">
            <a href="#" className="text-sm font-medium text-cyan-400 hover:text-cyan-300">
              Forgot your password?
            </a>
          </div>

          {/* Display error message if any */}
          {error && <p className="text-sm text-center text-red-400">{error}</p>}

          {/* Sign In Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-lg text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition duration-300 transform hover:scale-105 disabled:bg-cyan-800"
            >
              {loading ? <Spinner /> : 'Sign In'}
            </button>
          </div>
        </form>
        
        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-400 bg-gray-800 rounded-full">Or continue with</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <div>
          <button
            type="button"
            disabled={googleLoading}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 text-sm font-medium rounded-lg text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-300 disabled:bg-gray-800"
          >
            {googleLoading ? <Spinner /> : <FaGoogle />}
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
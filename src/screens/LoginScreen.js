// src/screens/LoginScreen.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/AuthProvider';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/swipe'); // ✅ Redirect after successful login
    }
  }, [user, navigate]);

  const handleOAuthLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: 'https://eartickle.com/swipe' } // change if needed
    });

    if (error) {
      console.error(`OAuth login error with ${provider}:`, error.message);
      setMessage(`Login with ${provider} failed.`);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      console.error('Email login error:', error.message);
      setMessage('Could not send magic link.');
    } else {
      setMessage('Magic login link sent! Check your email.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <img src="/logo.png" alt="EarTickle Logo" className="w-20 h-20 mx-auto" />
        <h1 className="text-4xl font-bold">EarTickle™</h1>
        <p className="text-gray-400 text-sm">Swipe. Stack. Play.</p>

        <div className="space-y-4 pt-4">
          <button
            onClick={() => handleOAuthLogin('github')}
            className="bg-white text-black font-semibold py-2 px-4 rounded w-full hover:bg-gray-200"
          >
            Login with GitHub
          </button>

          <button
            onClick={() => handleOAuthLogin('google')}
            className="bg-red-500 text-white font-semibold py-2 px-4 rounded w-full hover:bg-red-600"
          >
            Login with Google
          </button>

          <button
            onClick={() => handleOAuthLogin('spotify')}
            className="bg-green-500 text-white font-semibold py-2 px-4 rounded w-full hover:bg-green-600"
          >
            Login with Spotify
          </button>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4 pt-6">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
          <button
            type="submit"
            className="bg-blue-400 text-black font-semibold py-2 px-4 rounded w-full hover:bg-blue-300"
          >
            Send Magic Link
          </button>
        </form>

        {message && <p className="mt-4 text-teal-300">{message}</p>}
      </div>
    </div>
  );
};

export default LoginScreen;

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
      navigate('/swipe');
    }
  }, [user, navigate]);

  const handleOAuthLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: 'https://eartickle.com/swipe' }
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
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-black animate-pulse opacity-40 z-0" />

      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-20 text-center">
        <img src="/logo.png" alt="EarTickle Logo" className="w-24 h-24 mb-4" />
        <h1 className="text-5xl font-extrabold mb-2">EarTickle™</h1>
        <p className="text-lg text-teal-300 mb-8">Swipe. Stack. Play.</p>

        {/* Feature Highlights */}
        <div className="space-y-2 mb-10 text-sm text-gray-300 max-w-md">
          <p>🎧 All Your Saved Jams, Always</p>
          <p>🔀 Stacker Shuffle: Rediscover what you love</p>
          <p>🌱 Artists: Share your full catalog with fans</p>
          <p>📈 Grow your following and get real feedback</p>
          <p>🪙 Rewards Coming Soon – Be Early</p>
        </div>

        {/* Login Buttons */}
        <div className="space-y-4 w-full max-w-xs">
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

        {/* Magic Link Email */}
        <form onSubmit={handleEmailLogin} className="space-y-4 pt-6 w-full max-w-xs">
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

        {message && <p className="mt-4 text-teal-300 text-sm">{message}</p>}
      </div>
    </div>
  );
};

export default LoginScreen;

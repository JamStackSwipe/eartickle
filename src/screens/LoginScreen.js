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
  }, [user]);

  const handleOAuthLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: 'https://eartickle.com/swipe' },
    });

    if (error) {
      console.error(`OAuth login error with ${provider}:`, error.message);
      setMessage(`Login with ${provider} failed.`);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://eartickle.com/swipe',
      },
    });

    if (error) {
      console.error('Email login error:', error.message);
      setMessage('Could not send magic link.');
    } else {
      setMessage('Magic login link sent! Check your email.');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-black to-black text-white overflow-hidden">
      {/* 🎶 Animated Music Notes Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="falling-note"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              fontSize: `${Math.random() * 1.5 + 1}rem`,
            }}
          >
            {Math.random() > 0.5 ? '🎵' : '🎶'}
          </span>
        ))}
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-20 text-center">
        {/* Logo + Tagline */}
        <div className="mb-10 select-none">
          <a href="/" className="inline-block transition-transform hover:scale-105">
            <img
              src="/logo.png"
              alt="EarTickle Logo"
              className="w-32 h-32 mx-auto mb-2 rounded-lg shadow-lg"
            />
          </a>
          <h1 className="text-5xl font-bold">EarTickle</h1>
          <p className="text-base text-teal-300 mt-1">Swipe. Stack. Play.</p>
        </div>

        {/* App Highlights */}
        <div className="text-gray-300 space-y-1 text-sm mb-8">
          <p>🎧 All Your Saved Jams, Always</p>
          <p>🔀 Stacker Shuffle: Rediscover what you love</p>
          <p>🌱 Artists: Share your full catalog with fans</p>
          <p>📈 Real feedback, real growth</p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() => handleOAuthLogin('github')}
            className="bg-white text-black font-semibold py-2 px-4 rounded w-full hover:bg-gray-200"
          >
            Continue with GitHub
          </button>

          <button
            onClick={() => handleOAuthLogin('google')}
            className="bg-red-500 text-white font-semibold py-2 px-4 rounded w-full hover:bg-red-600"
          >
            Continue with Google
          </button>
        </div>

        {/* Magic Link Dev Only */}
        {process.env.NODE_ENV !== 'production' && (
          <form
            onSubmit={handleEmailLogin}
            className="space-y-3 pt-6 w-full max-w-xs"
          >
            <input
              type="email"
              placeholder="Email for magic link"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded text-black focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-400 text-black font-semibold py-2 px-4 rounded w-full hover:bg-blue-300"
            >
              Send Magic Link
            </button>
          </form>
        )}

        {/* Status Message */}
        {message && <p className="mt-4 text-teal-300 text-sm">{message}</p>}
      </div>
    </div>
  );
};

export default LoginScreen;

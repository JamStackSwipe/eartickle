// src/pages/LoginScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/AuthProvider';

const SITE_KEY = '0x4AAAAAABfXtuzGtZVDEqPR'; // EarTickle Turnstile key

const LoginScreen = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [covers, setCovers] = useState([]);
  const tokenRef = useRef(null);          // holds Turnstile token

  /* ─────────────────── auth short-circuit ─────────────────── */
  useEffect(() => {
    if (user) navigate('/swipe');
  }, [user, navigate]);

  /* ─────────────────── load backgrounds ─────────────────── */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('cover')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) console.error('❌ Error fetching covers:', error.message);
      else setCovers(data.map((s) => s.cover).filter(Boolean));
    })();
  }, []);

  /* ─────────────────── Turnstile embed ─────────────────── */
  useEffect(() => {
    // Inject script once
    if (!window.turnstile) {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
    }
    // Render widget when API ready
    const interval = setInterval(() => {
      if (window.turnstile && document.getElementById('ts-container')) {
        clearInterval(interval);
        window.turnstile.render('#ts-container', {
          sitekey: SITE_KEY,
          callback: (token) => (tokenRef.current = token),
          expiration: () => (tokenRef.current = null),
        });
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  /* ─────────────────── handlers ─────────────────── */
  const requireToken = () => {
    if (!tokenRef.current) {
      setMessage('Please complete the bot verification first.');
      return false;
    }
    return true;
  };

  const handleOAuthLogin = async (provider) => {
    if (!requireToken()) return;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: 'https://eartickle.com/swipe' },
    });
    if (error) {
      console.error(`OAuth error (${provider}):`, error.message);
      setMessage(`Login with ${provider} failed.`);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!requireToken()) return;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'https://eartickle.com/swipe' },
    });
    setMessage(
      error ? 'Could not send magic link.' : 'Magic link sent! Check your email.'
    );
    if (error) console.error('Email login error:', error.message);
  };

  /* ─────────────────── presentation ─────────────────── */
  const staticEmojis = ['🎵', '🎶', '🎤', '🎸', '🥁'];

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* background collage */}
      {[...covers, ...staticEmojis].map((item, i) => {
        const size = Math.random() * 40 + 40;
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        return item.startsWith('http') ? (
          <img
            key={i}
            src={item}
            alt={`cover-${i}`}
            className="absolute opacity-20"
            style={{
              width: size,
              top: `${top}%`,
              left: `${left}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ) : (
          <span
            key={i}
            className="absolute text-2xl select-none opacity-10"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          >
            {item}
          </span>
        );
      })}

      {/* login card */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-10 select-none">
          <a href="/" className="inline-block transition-transform hover:scale-105">
            <img
              src="/logo.png"
              alt="EarTickle Logo"
              className="w-32 h-32 mx-auto mb-2 rounded-lg shadow-lg"
            />
          </a>
          <h1 className="text-5xl font-bold text-black">EarTickle</h1>
          <p className="text-base text-gray-600 mt-1">Swipe. Stack. Play.</p>
        </div>

        <div className="text-gray-500 space-y-1 text-sm mb-8">
          <p>🎧 All Your Saved Jams, Always</p>
          <p>🔀 Stacker Shuffle: Rediscover what you love</p>
          <p>🌱 Artists: Share your full catalog with fans</p>
        </div>

        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() => handleOAuthLogin('github')}
            className="bg-black text-white font-semibold py-2 px-4 rounded w-full hover:bg-gray-800"
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

        {/* Turnstile widget */}
        <div id="ts-container" className="my-4" />

        {/* Magic link (dev only) */}
        {process.env.NODE_ENV !== 'production' && (
          <form onSubmit={handleEmailLogin} className="space-y-3 pt-4 w-full max-w-xs">
            <input
              type="email"
              placeholder="Email for magic link"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded border text-black focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-400 text-black font-semibold py-2 px-4 rounded w-full hover:bg-blue-300"
            >
              Send Magic Link
            </button>
          </form>
        )}

        {message && <p className="mt-4 text-green-600 text-sm">{message}</p>}
      </div>
    </div>
  );
};

export default LoginScreen;


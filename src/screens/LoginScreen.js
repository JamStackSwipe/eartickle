// app/login/page.js (App Router; client component for interactivity)
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const SITE_KEY = '0x4AAAAAABfXtuzGtZVDEqPR'; // EarTickle Turnstile key

const LoginScreen = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [covers, setCovers] = useState([]);
  const tokenRef = useRef(null);

  /* ─────────────────── auth short-circuit ─────────────────── */
  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user) router.push('/swipe');
  }, [session, status, router]);

  /* ─────────────────── load backgrounds ─────────────────── */
  useEffect(() => {
    const fetchCovers = async () => {
      try {
        const response = await fetch('/api/covers?limit=10', { cache: 'no-store' });
        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();
        setCovers(data.map((s) => s.cover).filter(Boolean));
      } catch (error) {
        console.error('❌ Error fetching covers:', error.message);
      }
    };
    fetchCovers();
  }, []);

  /* ─────────────────── Turnstile embed ─────────────────── */
  useEffect(() => {
    if (!window.turnstile) {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
      s.onload = () => renderTurnstile();
    } else {
      renderTurnstile();
    }

    function renderTurnstile() {
      const interval = setInterval(() => {
        if (window.turnstile && document.getElementById('ts-container')) {
          clearInterval(interval);
          window.turnstile.render('#ts-container', {
            sitekey: SITE_KEY,
            callback: (token) => (tokenRef.current = token),
            'expired-callback': () => (tokenRef.current = null),
            'error-callback': (errorCode) => {
              console.error('Turnstile error:', errorCode);
              setMessage('Verification failed—try refreshing.');
            },
          });
        }
      }, 200);
    }

    return () => {
      if (window.turnstile && document.getElementById('ts-container')) {
        window.turnstile.remove('#ts-container');
      }
    };
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

    // Validate Turnstile server-side first
    const verifyRes = await fetch('/api/turnstile/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenRef.current }),
    });
    if (!verifyRes.ok) {
      setMessage('Bot verification failed—try again.');
      return;
    }

    // Proceed with NextAuth signIn
    const { signIn } = await import('next-auth/react');
    await signIn(provider, { callbackUrl: '/swipe' });
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!requireToken()) return;

    // Validate Turnstile
    const verifyRes = await fetch('/api/turnstile/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenRef.current }),
    });
    if (!verifyRes.ok) {
      setMessage('Bot verification failed—try again.');
      return;
    }

    // Send magic link via custom API (integrates with NextAuth email provider)
    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const { error } = await res.json();
    setMessage(error ? 'Could not send magic link.' : 'Magic link sent! Check your email.');
    if (error) console.error('Email login error:', error);
  };

  /* ─────────────────── presentation ─────────────────── */
  const staticEmojis = ['🎵', '🎶', '🎤', '🎸', '🥁'];
  const collageItems = [...covers, ...staticEmojis];

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* background collage */}
      {collageItems.map((item, i) => {
        const size = Math.random() * 40 + 40;
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const rotation = Math.random() * 360;
        return item.startsWith('http') ? (
          <Image
            key={i}
            src={item}
            alt={`cover-${i}`}
            width={size}
            height={size}
            className="absolute opacity-20"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              transform: `rotate(${rotation}deg)`,
              objectFit: 'cover',
            }}
          />
        ) : (
          <span
            key={i}
            className="absolute text-2xl select-none opacity-10"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {item}
          </span>
        );
      })}

      {/* login card */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-20 text-center min-h-screen">
        <div className="mb-10 select-none">
          <a href="/" className="inline-block transition-transform hover:scale-105">
            <Image
              src="/logo.png"
              alt="EarTickle Logo"
              width={128}
              height={128}
              className="mx-auto mb-2 rounded-lg shadow-lg"
              priority
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
            className="bg-black text-white font-semibold py-2 px-4 rounded w-full hover:bg-gray-800 transition-colors"
          >
            Continue with GitHub
          </button>
          <button
            onClick={() => handleOAuthLogin('google')}
            className="bg-red-500 text-white font-semibold py-2 px-4 rounded w-full hover:bg-red-600 transition-colors"
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
              className="w-full p-3 rounded border text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-blue-400 text-black font-semibold py-2 px-4 rounded w-full hover:bg-blue-300 transition-colors"
            >
              Send Magic Link
            </button>
          </form>
        )}

        {message && (
          <p className={`mt-4 text-sm ${message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;

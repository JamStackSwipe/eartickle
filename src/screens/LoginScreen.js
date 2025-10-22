// src/screens/LoginScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase'; // Keeping Supabase auth temporarily
import { useRouter } from 'next/router';
import { useUser } from '../components/AuthProvider';

const SITE_KEY = '0x4AAAAAABfXtuzGtZVDEqPR'; // EarTickle Turnstile key

const LoginScreen = () => {
  const router = useRouter();
  const { user } = useUser();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [covers, setCovers] = useState([]);
  const tokenRef = useRef(null);

  /* ─────────────────── auth short-circuit ─────────────────── */
  useEffect(() => {
    if (user) router.push('/swipe');
  }, [user, router]);

  /* ─────────────────── load backgrounds ─────────────────── */
  useEffect(() => {
    const fetchCovers = async () => {
      try {
        const response = await fetch('/api/songs/covers?limit=10');
        if (response.ok) {
          const data = await response.json();
          setCovers(data.map((s) => s.cover_url).filter(Boolean));
        }
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
    }

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
    <div className="relative

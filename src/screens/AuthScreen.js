import React, { useState } from 'react';
import { supabase } from '../supabase';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleMagicLink = async () => {
    setMessage('Sending magic link...');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('✅ Magic link sent! Check your email.');
    }
  };

  const handleGitHubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'github' });
    if (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Sign In to EarTickle</h1>

      <div className="w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          valu

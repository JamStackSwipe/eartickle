// src/screens/AuthScreen.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/AuthProvider'; // ✅ Corrected

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user } = useUser(); // ✅ Corrected

  // 🔁 Redirect to /profile when logged in
  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleMagicLink}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Send Magic Link
        </button>

        <hr className="my-4" />

        <button
          onClick={handleGitHubLogin}
          className="w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-900"
        >
          Sign in with GitHub
        </button>

        {message && <p className="text-center text-sm mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default AuthScreen;

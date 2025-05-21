import React from 'react';
import { supabase } from '../supabase';

const LoginScreen = () => {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'github' });
    if (error) console.error('Login error:', error.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <img src="/logo.png" alt="EarTickle Logo" className="w-20 h-20 mx-auto" />
        <h1 className="text-4xl font-bold">EarTickle™</h1>
        <p className="text-gray-400 text-sm">Swipe. Stack. Play.</p>

        <button
          onClick={handleLogin}
          className="mt-6 bg-teal-400 hover:bg-teal-300 text-black font-semibold py-3 px-6 rounded-lg transition"
        >
          Login with GitHub
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;

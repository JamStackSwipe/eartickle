import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../supabase';

const AuthScreen = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // Dynamically import navigate only when Router is mounted
      import('react-router-dom').then(({ useNavigate }) => {
        const nav = useNavigate(); // still safe inside this dynamic block
        nav('/profile');
      });
    }
  }, [user, loading]);

  const handleLogin = async (provider) => {
    await supabase.auth.signInWithOAuth({ provider });
  };

  return (
    <div className="text-white p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Login to EarTickle</h1>
      <button onClick={() => handleLogin('github')} className="bg-gray-700 px-4 py-2 rounded mb-2 block">
        Sign in with GitHub
      </button>
      <button onClick={() => handleLogin('spotify')} className="bg-green-600 px-4 py-2 rounded block">
        Sign in with Spotify
      </button>
    </div>
  );
};

export default AuthScreen;


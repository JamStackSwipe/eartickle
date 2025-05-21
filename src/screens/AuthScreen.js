
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../supabase';

const AuthScreen = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/profile');
    }
  }, [user, loading, navigate]);

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


import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { supabase } from "../supabase";

const AuthScreen = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/profile"); // ✅ Only redirect once auth is ready
    }
  }, [user, loading, navigate]);

  const handleLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
    });

    if (error) {
      console.error("OAuth login error:", error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white space-y-6">
      <h1 className="text-3xl font-bold">Login to EarTickle</h1>
      <button
        onClick={() => handleLogin("github")}
        className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded text-white"
      >
        Sign in with GitHub
      </button>
      <button
        onClick={() => handleLogin("spotify")}
        className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded text-white"
      >
        Sign in with Spotify
      </button>
    </div>
  );
};

export default AuthScreen;

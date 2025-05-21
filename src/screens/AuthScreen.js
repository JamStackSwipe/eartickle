import React, { useState } from "react";
import { supabase } from "../supabase";

const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMagicLinkLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Check your email for a magic login link.");
    }
  };

  const handleGitHubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "github" });
    if (error) {
      console.error("GitHub login error:", error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-center">Login to EarTickle</h1>

        <form onSubmit={handleMagicLinkLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email for magic link"
            className="w-full px-4 py-2 rounded bg-gray-800 text-white"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-white font-semibold"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        <div className="text-center">or</div>

        <button
          onClick={handleGitHubLogin}
          className="w-full bg-gray-900 hover:bg-gray-800 py-2 rounded text-white font-semibold"
        >
          Sign in with GitHub
        </button>

        {message && <p className="text-center text-sm mt-4 text-green-400">{message}</p>}
      </div>
    </div>
  );
};

export default AuthScreen;

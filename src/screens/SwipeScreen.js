// src/screens/SettingsScreen.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [copied, setCopied] = useState(false);

  const shareLink = userId ? `${window.location.origin}/artist/${userId}` : '';

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        setUserEmail(data.user.email);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.');
    if (!confirmed) return;

    const { error } = await supabase.rpc('delete_user');
    if (error) {
      alert('Error deleting account: ' + error.message);
    } else {
      await supabase.auth.signOut();
      alert('Account deleted successfully.');
      navigate('/');
    }
  };

  const handlePasswordReset = async () => {
    if (userEmail) {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/profile`
      });
      if (error) {
        alert('Error sending password reset: ' + error.message);
      } else {
        alert('Password reset link sent to your email.');
      }
    }
  };

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      {userId && (
        <div className="bg-gray-100 text-sm p-3 mb-4 rounded">
          🔐 <strong>User ID:</strong><br />
          <code className="break-all">{userId}</code>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handlePasswordReset}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        >
          🔒 Reset Password
        </button>

        <button
          onClick={handleDeleteAccount}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
        >
          ❌ Delete My Account
        </button>

        <button
          onClick={handleLogout}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full"
        >
          🚪 Logout
        </button>
      </div>

      {userId && (
        <div className="bg-gray-100 p-4 mt-6 rounded">
          <h2 className="font-semibold mb-2">🎤 Share Your Artist Profile</h2>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="w-full p-2 border rounded text-sm bg-white"
            />
            <button
              onClick={handleCopy}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
            >
              {copied ? '✅ Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      <hr className="my-6" />

      <div className="text-sm text-gray-400">
        Are you an artist? You can update your profile info <a href="/profile" className="underline">here</a>.
      </div>
    </div>
  );
};

export default SettingsScreen;

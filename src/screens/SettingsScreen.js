// src/screens/SettingsScreen.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        setUserEmail(data.user.email);
        fetchPreferences(data.user.id);
        fetchGenresFromSongs();
      }
    };
    fetchUser();
  }, []);

  const fetchGenresFromSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('genre')
      .not('genre', 'is', null);

    if (error) {
      console.error('❌ Error fetching genres:', error);
      return;
    }

    const uniqueGenres = [...new Set(data.map((song) => song.genre).filter(Boolean))].sort();
    setAvailableGenres(uniqueGenres);
  };

  const fetchPreferences = async (uid) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('preferred_genres')
      .eq('id', uid)
      .single();

    if (data?.preferred_genres) {
      setSelectedGenres(data.preferred_genres);
    }
  };

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const saveGenres = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ preferred_genres: selectedGenres })
      .eq('id', userId);

    if (!error) alert('✅ Genres saved!');
    else console.error('❌ Error saving genres:', error);
  };

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

      {/* 🔥 Genre Preference Section */}
      <hr className="my-6" />

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">🎵 Favorite Genres</label>
        {availableGenres.length === 0 ? (
          <p className="text-gray-400 text-sm">No genres found in songs yet.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {availableGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    selectedGenres.includes(genre)
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            <button
              onClick={saveGenres}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              💾 Save Preferences
            </button>
          </>
        )}
      </div>

      <hr className="my-6" />

      <div className="text-sm text-gray-400">
        Are you an artist? You can update your profile info <a href="/profile" className="underline">here</a>.<br />
        Want to share your profile? Just send people to: <br />
        <code className="text-xs break-all">{`${window.location.origin}/artist/YOUR_ID`}</code>
      </div>
    </div>
  );
};

export default SettingsScreen;

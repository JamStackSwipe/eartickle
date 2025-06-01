import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import ConnectStripeButton from '../components/ConnectStripeButton';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sentTickles, setSentTickles] = useState([]);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { id, email } = data.user;
        setUserId(id);
        setUserEmail(email);
        fetchPreferences(id);
        fetchGenresFromSongs();
        fetchSentTickles(id);
        fetchSongs(id);
      }
    };
    fetchUser();
  }, []);

  const fetchGenresFromSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('genre')
      .not('genre', 'is', null);

    if (error) return console.error('❌ Error fetching genres:', error);
    const unique = [...new Set(data.map((s) => s.genre).filter(Boolean))].sort();
    setAvailableGenres(unique);
  };

  const fetchPreferences = async (uid) => {
    const { data } = await supabase
      .from('profiles')
      .select('preferred_genres')
      .eq('id', uid)
      .maybeSingle();

    if (data?.preferred_genres) setSelectedGenres(data.preferred_genres);
  };

  const fetchSentTickles = async (uid) => {
    const { data, error } = await supabase
      .from('tickles')
      .select('song_id')
      .eq('user_id', uid);

    if (error) {
      console.error('❌ Error fetching sent tickles:', error);
    } else {
      setSentTickles(data || []);
    }
  };

  const fetchSongs = async (uid) => {
    const { data, error } = await supabase
      .from('songs')
      .select('id')
      .eq('user_id', uid);

    if (error) console.error('❌ Error fetching songs:', error);
    setSongs(data || []);
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
    if (error) return console.error('❌ Error saving genres:', error);
    alert('✅ Genres saved!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to permanently delete your account?');
    if (!confirmed) return;

    const { error } = await supabase.rpc('delete_user');
    if (error) return alert('Error deleting account: ' + error.message);

    await supabase.auth.signOut();
    alert('Account deleted successfully.');
    navigate('/');
  };

  const handlePasswordReset = async () => {
    if (!userEmail) return;
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/profile`
    });
    if (error) alert('Error sending password reset: ' + error.message);
    else alert('Password reset link sent to your email.');
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      {userId && (
        <div className="bg-gray-100 text-sm p-3 mb-4 rounded text-black">
          🔐 <strong>User ID:</strong><br />
          <code className="break-all">{userId}</code>
        </div>
      )}

      <div className="space-y-4">
        <button onClick={handlePasswordReset} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full">
          🔒 Reset Password
        </button>
        <button onClick={handleDeleteAccount} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full">
          ❌ Delete My Account
        </button>
        <button onClick={handleLogout} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full">
          🚪 Logout
        </button>
      </div>

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

      {songs?.length > 0 && (
        <div className="my-6">
          <h2 className="text-lg font-semibold mb-2">💸 Artist Payments</h2>
          <p className="text-sm text-gray-400 mb-3">
            Connect your Stripe account to receive gifts (Tickles) from fans.
          </p>
          <ConnectStripeButton userId={userId} email={userEmail} />
        </div>
      )}

      <div className="mt-8">
        <p className="text-sm text-gray-300 mb-1">Want to share your artist profile?</p>
        <div className="flex items-center gap-2 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg">
          <input
            readOnly
            value={`${window.location.origin}/artist/${userId}`}
            className="flex-1 bg-transparent outline-none text-white text-sm"
            onClick={(e) => e.target.select()}
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/artist/${userId}`);
              alert('✅ Profile link copied!');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;

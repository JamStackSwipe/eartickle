import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import ConnectStripeButton from '../components/ConnectStripeButton';
import toast from 'react-hot-toast';

const genreFlavors = [
  { name: 'Country & Roots', tag: 'country_roots' },
  { name: 'Hip-Hop & Flow', tag: 'hiphop_flow' },
  { name: 'Rock & Raw', tag: 'rock_raw' },
  { name: 'Pop & Shine', tag: 'pop_shine' },
  { name: 'Spiritual & Soul', tag: 'spiritual_soul' },
  { name: 'Electronic & Vibe', tag: 'electronic_vibe' }, // Placeholder for sixth flavor; replace if different
];

const SettingsScreen = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sentTickles, setSentTickles] = useState([]);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (data?.user) {
          const { id, email } = data.user;
          setUserId(id);
          setUserEmail(email);
          fetchPreferences(id);
          fetchSentTickles(id);
          fetchSongs(id);
        }
      } catch (error) {
        console.error('❌ Error fetching user:', error);
        toast.error('Failed to load user data');
      }
    };
    fetchUser();
  }, []);

  const fetchPreferences = async (uid) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferred_genres')
        .eq('id', uid)
        .maybeSingle();
      if (error) throw error;
      if (data?.preferred_genres) setSelectedGenres(data.preferred_genres);
    } catch (error) {
      console.error('❌ Error fetching preferences:', error);
    }
  };

  const fetchSentTickles = async (uid) => {
    try {
      const { data, error } = await supabase
        .from('tickles')
        .select('song_id')
        .eq('user_id', uid);
      if (error) throw error;
      setSentTickles(data || []);
    } catch (error) {
      console.error('❌ Error fetching sent tickles:', error);
    }
  };

  const fetchSongs = async (uid) => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('id')
        .eq('user_id', uid);
      if (error) throw error;
      setSongs(data || []);
    } catch (error) {
      console.error('❌ Error fetching songs:', error);
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
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_genres: selectedGenres })
        .eq('id', userId);
      if (error) throw error;
      toast.success('Genre Flavors saved!');
    } catch (error) {
      console.error('❌ Error saving genres:', error);
      toast.error('Failed to save genres');
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast.error('Failed to log out: ' + error.message);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to permanently delete your account?');
    if (!confirmed) return;

    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('❌ Delete account error:', error);
      toast.error('Error deleting account: ' + error.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!userEmail) {
      toast.error('No email found for user');
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/profile`,
      });
      if (error) throw error;
      toast.success('Password reset link sent to your email');
    } catch (error) {
      console.error('❌ Password reset error:', error);
      toast.error('Error sending password reset: ' + error.message);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <h1 className="text-3xl font-bold text-[#3FD6CD] mb-6 text-center">Settings</h1>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        {userId && (
          <div className="bg-gray-50 text-sm p-4 rounded-lg text-gray-800">
            <strong className="flex items-center gap-1">🔐 User ID:</strong>
            <code className="block break-all mt-1">{userId}</code>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handlePasswordReset}
            className="w-full px-4 py-2 text-white rounded-lg hover:shadow-md transition"
            style={{ backgroundColor: '#3FD6CD' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2CB9B0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3FD6CD')}
          >
            🔒 Reset Password
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            ❌ Delete My Account
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-white rounded-lg hover:shadow-md transition"
            style={{ backgroundColor: '#3FD6CD' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2CB9B0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3FD6CD')}
          >
            🚪 Logout
          </button>
        </div>

        <hr className="my-6 border-t border-[#3FD6CD]" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">🎵 Favorite Genre Flavors</label>
          {genreFlavors.length === 0 ? (
            <p className="text-gray-500 text-sm">No genre flavors available yet.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {genreFlavors.map((flavor) => (
                  <button
                    key={flavor.tag}
                    onClick={() => toggleGenre(flavor.tag)}
                    className={`px-3 py-1 rounded-full border text-sm transition ${
                      selectedGenres.includes(flavor.tag)
                        ? 'bg-[#3FD6CD] text-white border-[#3FD6CD]'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {flavor.name}
                  </button>
                ))}
              </div>
              <button
                onClick={saveGenres}
                className="w-full px-4 py-2 text-white rounded-lg hover:shadow-md transition"
                style={{ backgroundColor: '#3FD6CD' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2CB9B0')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3FD6CD')}
              >
                💾 Save Preferences
              </button>
            </>
          )}
        </div>

        <hr className="my-6 border-t border-[#3FD6CD]" />

        {songs?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-[#3FD6CD] mb-3">💸 Artist Payments</h2>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Stripe account to receive gifts (Tickles) from fans.
            </p>
            <ConnectStripeButton userId={userId} email={userEmail} />
          </div>
        )}

        <div>
          <p className="text-sm text-gray-600 mb-2">Want to share your artist profile?</p>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
            <input
              readOnly
              value={`${window.location.origin}/artist/${userId}`}
              className="flex-1 bg-transparent outline-none text-gray-700 text-sm"
              onClick={(e) => e.target.select()}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/artist/${userId}`);
                toast.success('Profile link copied!');
              }}
              className="px-3 py-1 text-white rounded-lg text-xs hover:shadow-md transition"
              style={{ backgroundColor: '#3FD6CD' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2CB9B0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3FD6CD')}
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;

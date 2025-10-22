// screens/SettingsScreen.js – Neon migration (NextAuth + fetch API)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConnectStripeButton from '../components/ConnectStripeButton';
import toast from 'react-hot-toast';

const genreFlavors = [
  { value: 'country_roots', label: 'Country & Roots 🤠' },
  { value: 'hiphop_flow', label: 'Hip-Hop & Flow 🎤' },
  { value: 'rock_raw', label: 'Rock & Raw 🤘' },
  { value: 'pop_shine', label: 'Pop & Shine ✨' },
  { value: 'spiritual_soul', label: 'Spiritual & Soul ✝️' },
  { value: 'comedy_other', label: 'Comedy & Other 😂' },
];

const SettingsScreen = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sentTickles, setSentTickles] = useState([]);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    if (session?.user) {
      const { id, email } = session.user;
      setUserId(id);
      setUserEmail(email);
      fetchPreferences(id);
      fetchSentTickles(id);
      fetchSongs(id);
    }
  }, [session]);

  const fetchPreferences = async (uid) => {
    try {
      const res = await fetch(`/api/profiles/${uid}/preferences`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelectedGenres(data.preferred_genres || []);
    } catch (error) {
      console.error('Preferences error:', error);
    }
  };

  const fetchSentTickles = async (uid) => {
    try {
      const res = await fetch(`/api/tickles?user_id=${uid}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSentTickles(data || []);
    } catch (error) {
      console.error('Sent tickles error:', error);
    }
  };

  const fetchSongs = async (uid) => {
    try {
      const res = await fetch(`/api/songs?user_id=${uid}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSongs(data || []);
    } catch (error) {
      console.error('Songs error:', error);
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
      const res = await fetch(`/api/profiles/${userId}/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferred_genres: selectedGenres }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Genre Flavors saved!');
    } catch (error) {
      toast.error('Failed to save genres');
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to permanently delete your account?');
    if (!confirmed) return;
    try {
      const res = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error) {
      toast.error('Error deleting account');
    }
  };

  const handlePasswordReset = async () => {
    if (!userEmail) {
      toast.error('No email found for user');
      return;
    }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error('Error sending password reset');
    }
  };

  if (!session) return <div>Login required</div>;

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
                    key={flavor.value}
                    onClick={() => toggleGenre(flavor.value)}
                    className={`px-3 py-1 rounded-full border text-sm transition ${
                      selectedGenres.includes(flavor.value)
                        ? 'bg-[#3FD6CD] text-white border-[#3FD6CD]'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {flavor.label}
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

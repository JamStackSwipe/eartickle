// ✅ Unified ProfileScreen.js for users & artists

import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import { v4 as uuidv4 } from 'uuid';

const ProfileScreen = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState({});
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUploads();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('❌ Error fetching profile:', error.message);
    } else {
      setProfile(data || {});
    }
  };

  const fetchUploads = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching uploads:', error.message);
    } else {
      setSongs(data || []);
    }
    setLoading(false);
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const updates = {
      display_name: profile.display_name || '',
      bio: profile.bio || '',
      booking_email: profile.booking_email || '',
      website: profile.website || '',
      spotify: profile.spotify || '',
      youtube: profile.youtube || '',
      instagram: profile.instagram || '',
      soundcloud: profile.soundcloud || '',
      tiktok: profile.tiktok || '',
      bandlab: profile.bandlab || ''
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('❌ Error saving profile:', error.message);
      setMessage('Error saving.');
    } else {
      setMessage('✅ Profile saved!');
    }
  };

  const handleDelete = async (songId) => {
    if (!confirm('Delete this song?')) return;

    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId)
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Error deleting song:', error);
    } else {
      setSongs((prev) => prev.filter((s) => s.id !== songId));
    }
  };

  const avatarSrc =
    profile.avatar_url && profile.avatar_url.trim() !== ''
      ? profile.avatar_url
      : user?.user_metadata?.avatar_url || '/default-avatar.png';

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-white text-black p-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={avatarSrc}
          alt="avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-avatar.png';
          }}
          className="w-24 h-24 rounded-full object-cover border shadow"
        />
        <div className="flex-1">
          <input
            type="text"
            value={profile.display_name || ''}
            onChange={(e) => handleChange('display_name', e.target.value)}
            placeholder="Display Name"
            className="text-xl font-bold w-full border-b p-1"
          />
          <textarea
            value={profile.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell us about you..."
            className="w-full mt-2 p-2 border rounded"
            rows={3}
          />
        </div>
      </div>

      <label className="block text-sm font-semibold mt-4">📩 Booking Email</label>
      <input
        type="email"
        value={profile.booking_email || ''}
        onChange={(e) => handleChange('booking_email', e.target.value)}
        placeholder="you@email.com"
        className="w-full p-2 border rounded mb-2"
      />

      {['website', 'spotify', 'youtube', 'instagram', 'soundcloud', 'tiktok', 'bandlab'].map((field) => (
        <div key={field} className="mb-2">
          <label className="block text-sm font-semibold capitalize">{field}</label>
          <input
            type="text"
            value={profile[field] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full p-2 border rounded"
            placeholder={`https://${field}.com/yourprofile`}
          />
        </div>
      ))}

      <button
        onClick={handleSave}
        className="mt-4 bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
      >
        Save Profile
      </button>

      {message && <p className="mt-2 text-green-600">{message}</p>}

      {songs.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-10 mb-4">🎵 Your Uploaded Songs</h2>
          <ul className="space-y-4">
            {songs.map((song) => (
              <li
                key={song.id}
                className="bg-gray-100 p-4 rounded shadow flex items-center space-x-4"
              >
                <img
                  src={song.cover}
                  alt="cover"
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{song.title}</h3>
                  <p className="text-sm text-gray-500">{song.artist}</p>
                </div>
                <button
                  onClick={() => handleDelete(song.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  🗑️ Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ProfileScreen;

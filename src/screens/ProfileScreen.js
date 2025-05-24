// src/screens/ProfileScreen.js
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const ProfileScreen = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // ✅ Avoids crash if no row found

      if (error) {
        console.error('❌ Error loading profile:', error.message);
      } else if (!data) {
        console.warn("⚠️ No profile found for user ID:", user.id);
      } else {
        setProfile(data);
      }
    };

    const fetchSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching songs:', error.message);
      } else {
        setSongs(data);
      }

      setLoading(false);
    };

    fetchProfile();
    fetchSongs();
  }, [user]);

  if (loading || !profile) {
    return <div className="p-6 text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black p-6">
      {/* Profile header */}
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={profile.avatar_url || '/default-avatar.png'}
          alt="avatar"
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div>
          <h1 className="text-2xl font-bold">{profile.display_name || 'Unnamed User'}</h1>
          <p className="text-gray-600">{profile.bio || 'No bio yet.'}</p>
        </div>
      </div>

      {/* Songs */}
      <h2 className="text-xl font-semibold mb-3">🎵 Your Uploaded Songs</h2>
      {songs.length === 0 ? (
        <p className="text-gray-500">You haven’t uploaded any songs yet.</p>
      ) : (
        <ul className="space-y-4">
          {songs.map((song) => (
            <li
              key={song.id}
              className="bg-gray-100 p-4 rounded shadow flex items-center space-x-4"
            >
              <img
                src={song.cover || '/default-cover.png'}
                alt="cover"
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{song.title}</h3>
                <p className="text-sm text-gray-500">{song.artist}</p>
              </div>
              {/* Future: 🗑️ delete button here */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfileScreen;

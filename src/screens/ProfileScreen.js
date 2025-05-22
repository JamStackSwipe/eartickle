import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const ProfileScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserSongs = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('songs')
        .select('id, title, artist, cover')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user songs:', error);
      } else {
        setSongs(data);
      }

      setLoading(false);
    };

    fetchUserSongs();
  }, [user]);

  const handleDelete = async (songId) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId);

    if (error) {
      console.error('❌ Failed to delete song:', error);
      alert('Could not delete song. Please try again.');
      return;
    }

    setSongs((prev) => prev.filter((s) => s.id !== songId));
    alert('🗑️ Song deleted!');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">👤 My Profile</h1>
      <p className="mb-4">Email: {user?.email}</p>
      <p className="mb-8 text-sm text-gray-400">User ID: {user?.id}</p>

      {loading ? (
        <p>Loading your uploads...</p>
      ) : songs.length === 0 ? (
        <p className="text-gray-400">You haven’t uploaded any songs yet.</p>
      ) : (
        <ul className="space-y-4">
          {songs.map((song) => (
            <li
              key={song.id}
              className="bg-gray-900 p-4 rounded-lg shadow flex items-center space-x-4"
            >
              {song.cover ? (
                <img
                  src={song.cover}
                  alt="cover"
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-700 flex items-center justify-center rounded">
                  🎵
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{song.title || 'Untitled'}</h2>
                <p className="text-sm text-gray-400">{song.artist || 'Unknown Artist'}</p>
              </div>
              <button
                onClick={() => handleDelete(song.id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfileScreen;

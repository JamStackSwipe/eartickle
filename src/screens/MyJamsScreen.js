import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const MyJamsScreen = () => {
  const { user } = useUser();
  const [jams, setJams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyJams();
  }, [user]);

  const fetchMyJams = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('jamstacksongs')
      .select(`
        id,
        song_id,
        songs (
          id,
          title,
          artist,
          cover
        )
      `)
      .eq('user_id', user.id)
      .order('id', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Error fetching JamStack songs:', error);
    } else {
      setJams(data);
    }

    setLoading(false);
  };

  const handleDelete = async (songId) => {
    if (!confirm('Remove this song from your JamStack?')) return;

    const { error } = await supabase
      .from('jamstacksongs')
      .delete()
      .eq('user_id', user.id)
      .eq('song_id', songId);

    if (error) {
      console.error('❌ Error deleting song:', error);
      alert('Could not remove this song.');
      return;
    }

    // Update UI
    setJams((prev) => prev.filter((jam) => jam.song_id !== songId));
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🎧 My JamStack™</h1>

      {loading ? (
        <p>Loading your saved songs...</p>
      ) : jams.length === 0 ? (
        <p className="text-gray-400">You haven’t added any songs to your JamStack™ yet.</p>
      ) : (
        <ul className="space-y-4">
          {jams.map((jam) => (
            <li
              key={jam.id}
              className="bg-gray-900 p-4 rounded-lg shadow flex items-center space-x-4"
            >
              {jam.songs?.cover && (
                <img
                  src={jam.songs.cover}
                  alt="cover"
                  className="w-20 h-20 object-contain rounded"
                />
              )}
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{jam.songs?.title || 'Untitled'}</h2>
                <p className="text-sm text-gray-400">{jam.songs?.artist || 'Unknown Artist'}</p>
              </div>
              <button
                onClick={() => handleDelete(jam.song_id)}
                className="text-sm text-red-400 hover:text-red-600"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyJamsScreen;

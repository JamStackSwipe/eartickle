import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const MyJamsScreen = () => {
  const { user } = useUser();
  const [jams, setJams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyJams = async () => {
      if (!user) return;

      console.log('✅ MyJamsScreen is LIVE for user:', user.id);

      const { data: jamRows, error: jamError } = await supabase
        .from('jamstacksongs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (jamError) {
        console.error('❌ Failed to fetch jamstacksongs:', jamError);
        setLoading(false);
        return;
      }

      if (jamRows.length === 0) {
        setJams([]);
        setLoading(false);
        return;
      }

      const songIds = jamRows.map((j) => j.song_id);
      const { data: songsData, error: songError } = await supabase
        .from('songs')
        .select('id, title, artist, cover')
        .in('id', songIds);

      if (songError) {
        console.error('❌ Failed to fetch songs:', songError);
        setLoading(false);
        return;
      }

      const enriched = jamRows.map((jam) => ({
        ...jam,
        songs: songsData.find((s) => s.id === jam.song_id),
      }));

      setJams(enriched);
      setLoading(false);
    };

    fetchMyJams();
  }, [user]);

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
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div>
                <h2 className="text-lg font-semibold">{jam.songs?.title || 'Untitled'}</h2>
                <p className="text-sm text-gray-400">{jam.songs?.artist || 'Unknown Artist'}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyJamsScreen;


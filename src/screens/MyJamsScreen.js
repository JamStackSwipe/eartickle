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

      // Step 1: Fetch jamstacksongs by user
      const { data: jamRows, error: jamError } = await supabase
        .from('jamstacksongs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (jamError) {
        console.error('❌ Error fetching JamStack rows:', jamError);
        setLoading(false);
        return;
      }

      const songIds = jamRows.map((j) => j.song_id).filter(Boolean);

      // Step 2: Fetch songs by IDs
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('id, title, artist, cover')
        .in('id', songIds);

      if (songsError) {
        console.error('❌ Error fetching songs for JamStack:', songsError);
        setLoading(false);
        return;
      }

      // Step 3: Merge jams with songs
      const enriched = jamRows.map((jam) => {
        const song = songsData.find((s) => s.id === jam.song_id);
        if (!song) {
          console.warn('⚠️ No match for jam.song_id:', jam.song_id);
        }
        return {
          ...jam,
          song,
        };
      });

      setJams(enriched);
      setLoading(false);
    };

    fetchMyJams();
  }, [user]);

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <h1 className="text-3xl font-bold mb-6">🎧 My JamStack™</h1>

      {loading ? (
        <p>Loading your saved songs...</p>
      ) : jams.length === 0 ? (
        <p className="text-gray-600">You haven’t added any songs to your JamStack™ yet.</p>
      ) : (
        <ul className="space-y-4">
          {jams.map((jam) => (
            <li
              key={jam.id}
              className="bg-gray-100 p-4 rounded-lg shadow flex items-center space-x-4"
            >
              {jam.song?.cover ? (
                <img
                  src={jam.song.cover}
                  alt="cover"
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-300 flex items-center justify-center rounded">
                  🎵
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold">{jam.song?.title || 'Untitled'}</h2>
                <p className="text-sm text-gray-600">{jam.song?.artist || 'Unknown Artist'}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyJamsScreen;

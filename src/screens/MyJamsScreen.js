import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import SendTickleButton from '../components/SendTickleButton';

const MyJamsScreen = () => {
  const { user } = useUser();
  const [jams, setJams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reactionsMap, setReactionsMap] = useState({});

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
          cover,
          audio,
          stripe_account_id
        )
      `)
      .eq('user_id', user.id)
      .order('id', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Error fetching JamStack songs:', error);
    } else {
      setJams(data);
      fetchReactions(data.map(jam => jam.song_id));
    }

    setLoading(false);
  };

  const fetchReactions = async (songIds) => {
    const { data, error } = await supabase
      .from('reactions')
      .select('song_id, emoji, count:emoji')
      .in('song_id', songIds);

    if (error) {
      console.error('❌ Error fetching reactions:', error);
      return;
    }

    // Tally reactions
    const map = {};
    data.forEach(({ song_id, emoji }) => {
      if (!map[song_id]) map[song_id] = { '❤️': 0, '😢': 0, '🎯': 0, '👁': 0 };
      map[song_id][emoji] = (map[song_id][emoji] || 0) + 1;
    });

    setReactionsMap(map);
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
          {jams.map((jam) => {
            const song = jam.songs;
            const stats = reactionsMap[song.id] || { '❤️': 0, '😢': 0, '🎯': 0, '👁': 0 };

            return (
              <li
                key={jam.id}
                className="bg-gray-900 p-4 rounded-lg shadow space-y-2"
              >
                <div className="flex items-center space-x-4">
                  {song?.cover && (
                    <img
                      src={song.cover}
                      alt="cover"
                      className="w-20 h-20 object-contain rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{song?.title || 'Untitled'}</h2>
                    <p className="text-sm text-gray-400">{song?.artist || 'Unknown Artist'}</p>
                    {song.audio && (
                      <audio controls className="w-full mt-2">
                        <source src={song.audio} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(jam.song_id)}
                    className="text-sm text-red-400 hover:text-red-600"
                  >
                    🗑️
                  </button>
                </div>

                {/* Real reaction stats */}
                <div className="text-xs text-gray-400 mt-1 flex gap-3">
                  ❤️ {stats['❤️']} · 😢 {stats['😢']} · 🎯 {stats['🎯']} · 👁 {stats['👁']}
                </div>

                {/* Stripe Tickle Button */}
                <SendTickleButton
                  songId={song.id}
                  songTitle={song.title}
                  artistId={user.id}
                  artistStripeId={song.stripe_account_id}
                  senderId={user.id}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MyJamsScreen;

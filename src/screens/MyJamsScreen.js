import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import SendTickleButton from '../components/SendTickleButton';

const MyJamsScreen = () => {
  const { user } = useUser();
  const [jams, setJams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyJams();
  }, [user]);

  const fetchMyJams = async () => {
    if (!user) return;

    const { data: jamData, error } = await supabase
      .from('jamstacksongs')
      .select(`
        id,
        song_id,
        songs (
          id,
          user_id,
          title,
          artist,
          cover,
          audio,
          views,
          stripe_account_id
        )
      `)
      .eq('user_id', user.id)
      .order('id', { ascending: false })
      .limit(50);

    if (error || !jamData) {
      console.error('❌ Error fetching JamStack songs:', error);
      setLoading(false);
      return;
    }

    // Gather song IDs
    const songIds = jamData.map((jam) => jam.song_id);

    // Pull emoji reactions in one batch
    const { data: allReactions } = await supabase
      .from('reactions')
      .select('song_id, emoji')
      .in('song_id', songIds);

    const reactionStats = {};
    allReactions?.forEach((r) => {
      const sid = r.song_id;
      if (!reactionStats[sid]) {
        reactionStats[sid] = { '❤️': 0, '🔥': 0, '🎯': 0, '😢': 0 };
      }
      if (reactionStats[sid][r.emoji] !== undefined) {
        reactionStats[sid][r.emoji]++;
      }
    });

    // Jam counts
    const jamCounts = {};
    for (const songId of songIds) {
      const { count } = await supabase
        .from('jamstacksongs')
        .select('*', { count: 'exact', head: true })
        .eq('song_id', songId);
      jamCounts[songId] = count || 0;
    }

    const enriched = jamData.map((jam) => {
      const song = jam.songs;
      const reactions = reactionStats[song.id] || {};
      return {
        ...jam,
        stats: {
          likes: reactions['❤️'] || 0,
          fires: reactions['🔥'] || 0,
          sads: reactions['😢'] || 0,
          bullseyes: reactions['🎯'] || 0,
          views: song.views || 0,
          jams: jamCounts[song.id] || 0,
        },
      };
    });

    setJams(enriched);
    setLoading(false);
  };

  const handleDelete = async (songId) => {
    if (!confirm('Remove this song from your JamStack?')) return;

    const { error } = await supabase
      .from('jamstacksongs')
      .delete()
      .eq('user_id', user.id)
      .eq('song_id', songId);

    if (!error) {
      setJams((prev) => prev.filter((jam) => jam.song_id !== songId));
    } else {
      alert('Could not remove this song.');
    }
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
            const stats = jam.stats;

            return (
              <li key={jam.id} className="bg-gray-900 p-4 rounded-lg shadow space-y-2">
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

                <div className="text-xs text-gray-400 mt-1 flex gap-3 flex-wrap">
                  ❤️ {stats.likes} · 🔥 {stats.fires} · 😢 {stats.sads} · 🎯 {stats.bullseyes} · 👁 {stats.views} · 🎧 {stats.jams}
                </div>

                {/* Only allow tickles to other artists */}
                {user.id !== song.user_id && (
                  <SendTickleButton
                    songId={song.id}
                    songTitle={song.title}
                    artistId={song.user_id}
                    artistStripeId={song.stripe_account_id}
                    senderId={user.id}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MyJamsScreen;

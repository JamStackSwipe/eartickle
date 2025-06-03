import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from './AuthProvider';
import { playTickle } from '../utils/tickleSound';
import toast from 'react-hot-toast';
import AddToJamStackButton from './AddToJamStackButton';

const emojis = ['🔥', '❤️', '😢', '🎯'];

const ReactionStatsBar = ({ song }) => {
  const { user } = useUser();
  const [stats, setStats] = useState({});
  const [tickleBalance, setTickleBalance] = useState(null);
  const [hasReacted, setHasReacted] = useState({});

  useEffect(() => {
    const loadReactions = async () => {
      const { data, error } = await supabase
        .from('song_reactions')
        .select('emoji, count')
        .eq('song_id', song.id)
        .group('emoji');

      if (!error && data) {
        const mapped = {};
        data.forEach(({ emoji, count }) => {
          mapped[emoji] = count;
        });
        setStats(mapped);
      }

      if (user) {
        const { data: userReactions } = await supabase
          .from('song_reactions')
          .select('emoji')
          .eq('song_id', song.id)
          .eq('user_id', user.id);

        const reactedMap = {};
        userReactions?.forEach(({ emoji }) => {
          reactedMap[emoji] = true;
        });
        setHasReacted(reactedMap);
      }
    };

    const loadBalance = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('tickle_balance')
        .eq('id', user.id)
        .maybeSingle();
      setTickleBalance(data?.tickle_balance ?? 0);
    };

    loadReactions();
    loadBalance();
  }, [song.id, user]);

  const handleEmojiClick = async (emoji) => {
    if (!user) {
      toast.error('Login required to react');
      return;
    }

    if (hasReacted[emoji]) return;

    await supabase.from('song_reactions').insert([
      {
        user_id: user.id,
        song_id: song.id,
        emoji,
      },
    ]);

    setStats((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    setHasReacted((prev) => ({ ...prev, [emoji]: true }));
  };

  const handleSendTickle = async () => {
    if (!user) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;
    if (!token) {
      toast.error('Login required');
      return;
    }

    const res = await fetch('/api/send-tickle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        artist_id: song.user_id,
        song_id: song.id,
        emoji: '🎁',
      }),
    });

    const result = await res.json();
    if (res.ok) {
      playTickle();
      toast.success('1 Tickle sent to the artist!');
      setTickleBalance((prev) => (prev || 1) - 1);
    } else {
      toast.error(result.error || 'Failed to send tickle.');
    }
  };

  return (
    <div className="flex flex-col gap-2 text-sm w-full mt-3">
      <div className="flex items-center justify-start flex-wrap gap-4 text-lg text-white">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            className={`flex items-center space-x-1 transition-transform ${
              stats[emoji] ? 'opacity-100' : 'opacity-75'
            } ${
              hasReacted[emoji]
                ? 'opacity-50 cursor-default'
                : 'hover:scale-110 cursor-pointer'
            }`}
            disabled={hasReacted[emoji]}
          >
            <span>{emoji}</span>
            <span className="text-sm">{stats[emoji] || 0}</span>
          </button>
        ))}
        <span className="text-sm text-gray-300">👁️ {song.views || 0}</span>
        <span className="text-sm text-gray-300">📥 {song.jams || 0}</span>
      </div>

      <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
        <AddToJamStackButton
          songId={song.id}
          user={user}
          onAdded={() => {}}
        />

        {user && (
          <span className="text-xs text-gray-400 mx-auto">
            Tickles Left: <strong>{tickleBalance ?? '...'}</strong>
          </span>
        )}

        <button
          onClick={handleSendTickle}
          className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 rounded text-black text-xs font-semibold shadow-sm"
        >
          🎁 Send Tickle
        </button>
      </div>
    </div>
  );
};

export default ReactionStatsBar;

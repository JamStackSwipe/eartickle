import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from './AuthProvider';
import { playTickle } from '../utils/tickleSound';
import toast from 'react-hot-toast';

const emojis = ["🔥", "❤️", "😢", "🎯"];

const ReactionStatsBar = ({ song }) => {
  const { user } = useUser();
  const [stats, setStats] = useState({});
  const [showConfirm, setShowConfirm] = useState(null);
  
  const [tickleBalance, setTickleBalance] = useState(null);const handleSendTickle = async () => {
  console.log("🎯 Send Tickle button clicked", user);
  if (!user) return;
  ...
};


  

  // Load emoji counts + user balance
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

    await supabase.from('song_reactions').insert([
      {
        user_id: user.id,
        song_id: song.id,
        emoji,
      },
    ]);

    setStats((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
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
        emoji: "🎁",
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
    <div className="flex flex-col gap-2 text-lg mt-2 w-full">

      {/* Emoji Reactions */}
      <div className="flex flex-wrap gap-4">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            className="flex items-center space-x-1 hover:scale-110 transition-transform"
          >
            <span>{emoji}</span>
            <span className="text-sm">{stats[emoji] || 0}</span>
          </button>
        ))}
      </div>

      {/* Tickle Balance */}
      {user && (
        <div className="text-xs text-gray-600 text-right mr-1">
          Tickles Left: {tickleBalance ?? '...'}
        </div>
      )}

      {/* Gift Button */}
      <button
        onClick={handleSendTickle}
        className="self-end px-3 py-1 bg-yellow-400 rounded text-black text-sm font-medium"
      >
        🎁 Send Tickle
      </button>
    </div>
  );
};

export default ReactionStatsBar;

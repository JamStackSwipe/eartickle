import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from './AuthProvider';
import { playTickle } from '../utils/tickleSound';
import toast from 'react-hot-toast';
import AddToJamStackButton from './AddToJamStackButton';

const emojis = ['🔥', '💖', '😭', '🎯'];

const ReactionStatsBar = ({ song }) => {
  const { user } = useUser();
  const [stats, setStats] = useState({});
  const [tickleBalance, setTickleBalance] = useState(null);
  const [hasReacted, setHasReacted] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSendingTickle, setIsSendingTickle] = useState(false); // Added to disable button during API call

  const loadStats = async () => {
    try {
      const [{ data: reactionsData }, { data: balanceData }, { data: userReactions }] = await Promise.all([
        supabase.from('song_reactions').select('emoji').eq('song_id', song.id),
        user
          ? supabase.from('profiles').select('tickle_balance').eq('id', user.id).maybeSingle()
          : { data: null },
        user
          ? supabase.from('song_reactions').select('emoji').eq('song_id', song.id).eq('user_id', user.id)
          : { data: [] },
      ]);

      const counts = {};
      reactionsData?.forEach(({ emoji }) => {
        counts[emoji] = (counts[emoji] || 0) + 1;
      });

      const reacted = {};
      userReactions?.forEach(({ emoji }) => {
        reacted[emoji] = true;
      });

      setStats(counts);
      setHasReacted(reacted);
      setTickleBalance(balanceData?.tickle_balance ?? 0);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [song.id, user]);

  useEffect(() => {
    const handleTicklesUpdated = () => loadStats();
    window.addEventListener('ticklesUpdated', handleTicklesUpdated);
    return () => {
      window.removeEventListener('ticklesUpdated', handleTicklesUpdated);
    };
  }, []);

  const handleEmojiClick = async (emoji) => {
    if (!user) return toast.error('Login to react');
    if (hasReacted[emoji]) return toast('Already reacted');

    try {
      const { error } = await supabase.from('song_reactions').insert([
        { user_id: user.id, song_id: song.id, emoji },
      ]);

      if (error) {
        toast.error('Failed to add reaction');
        return;
      }

      setStats((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
      setHasReacted((prev) => ({ ...prev, [emoji]: true }));
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Network error, please try again');
    }
  };

  const handleSendTickle = async () => {
    if (!user) return toast.error('Login required');
    if (tickleBalance < 1) return toast.error('Not enough Tickles');
    if (isSendingTickle) return; // Prevent multiple clicks

    setIsSendingTickle(true);
    const previousBalance = tickleBalance;
    setTickleBalance((prev) => prev - 1); // Optimistic update

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        toast.error('Not authorized');
        setTickleBalance(previousBalance);
        return;
      }

      const res = await fetch('/api/send-tickle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          song_id: song.id, // Removed artist_id as it’s not used in the API
          emoji: '🎁',
        }),
      });

      const result = await res.json();
      if (res.ok) {
        playTickle();
        toast.success('1 Tickle sent!');
        // Refresh balance from backend
        const { data: balanceData } = await supabase
          .from('profiles')
          .select('tickle_balance')
          .eq('id', user.id)
          .maybeSingle();
        setTickleBalance(balanceData?.tickle_balance ?? 0);
      } else {
        toast.error(result.error || 'Failed to send tickle');
        setTickleBalance(previousBalance); // Revert optimistic update
      }
    } catch (error) {
      console.error('Error sending tickle:', error);
      toast.error('Network error, please try again');
      setTickleBalance(previousBalance); // Revert optimistic update
    } finally {
      setIsSendingTickle(false);
    }
  };

  return (
    <div className="w-full mt-2 text-sm">
      {/* Emoji Reaction Row */}
      <div className="flex justify-center items-center gap-6 text-2xl font-semibold mb-3">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            disabled={hasReacted[emoji]}
            className={`flex items-center gap-1 ${hasReacted[emoji] ? 'opacity-50' : 'hover:scale-110'} transition-transform`}
            aria-label={`React with ${emoji} emoji`}
          >
            <span>{emoji}</span>
            <span className="text-sm">{stats[emoji] || 0}</span>
          </button>
        ))}
        <span className="text-gray-400 text-sm">👁️ {song.views || 0}</span>
        <span className="text-gray-400 text-sm">📥 {song.jams || 0}</span>
      </div>

      {/* Jam + Tickle – color updated to match brand */}
      <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
        <AddToJamStackButton songId={song.id} user={user} />

        <div className="text-sm font-semibold text-[#00CEC8] border border-[#00CEC8] px-3 py-1 rounded-full shadow">
          🎶 My Tickles: {loading ? '...' : tickleBalance}
        </div>

        <button
          onClick={handleSendTickle}
          disabled={isSendingTickle || loading || tickleBalance < 1}
          className={`px-3 py-1 text-sm rounded-full font-semibold transition bg-[#00CEC8] text-black ${
            isSendingTickle || loading || tickleBalance < 1 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
          aria-label="Send a Tickle to the artist"
        >
          🎁 {isSendingTickle ? 'Sending...' : 'Send Tickle'}
        </button>
      </div>
    </div>
  );
};

export default ReactionStatsBar;

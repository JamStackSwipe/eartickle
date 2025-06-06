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

  const loadStats = async () => {
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
    setLoading(false);
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

    const { error } = await supabase.from('song_reactions').insert([
      { user_id: user.id, song_id: song.id, emoji },
    ]);

    if (!error) {
      setStats((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
      setHasReacted((prev) => ({ ...prev, [emoji]: true }));
    }
  };

  const handleSendTickle = async () => {
    if (!user) return toast.error('Login required');
    if ((tickleBalance ?? 0) < 1) return toast.error('Not enough Tickles');
    if (song.user_id === user.id) return toast.error('You can’t send Tickles to yourself!');

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return toast.error('Not authorized');

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
      toast.success('1 Tickle sent!');
      setTickleBalance((prev) => (prev || 1) - 1);
      loadStats();
    } else {
      toast.error(result.error || 'Failed to send tickle');
    }
  };

  const handleShareJam = async () => {
    const shareUrl = `${window.location.origin}/song/${song.id}`;
    const shareData = {
      title: `${song.title} by ${song.artist}`,
      text: `Check out this awesome song on EarTickle!`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Song link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share song');
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
          >
            <span>{emoji}</span>
            <span className="text-sm">{stats[emoji] || 0}</span>
          </button>
        ))}
        <span className="text-gray-400 text-sm">👁️ {song.views || 0}</span>
        <span className="text-gray-400 text-sm">📥 {song.jams || 0}</span>
      </div>

      {/* Action Row: Stack on Left, Share/Tickle/Balance on Right */}
      <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <AddToJamStackButton songId={song.id} user={user} />
          <button
            onClick={handleShareJam}
            className="px-3 py-1 text-sm rounded-full font-semibold transition bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            📤 Share Jam
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSendTickle}
            className="px-3 py-1 text-sm rounded-full font-semibold transition bg-[#3FD6CD] text-black hover:opacity-90"
          >
            🎁 Send Tickle
          </button>
          <div className="text-sm font-semibold text-[#3FD6CD] border border-[#3FD6CD] px-3 py-1 rounded-full shadow">
            🎶 My Tickles: {loading ? '...' : tickleBalance}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactionStatsBar;

// src/components/ReactionStatsBar.js
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useUser } from './AuthProvider';
import { playTickle } from '../utils/tickleSound';
import toast from 'react-hot-toast';

const emojis = ['🔥', '💖', '😭', '🎯'];

const ReactionStatsBar = ({ song }) => {
  const { user } = useUser();
  const [stats, setStats] = useState({});
  const [tickleBalance, setTickleBalance] = useState(null);
  const [hasReacted, setHasReacted] = useState({});
  const [loading, setLoading] = useState(true);
  const [isJammed, setIsJammed] = useState(false);
  const [jamLoading, setJamLoading] = useState(false);
  const navigate = useNavigate();

  const loadStats = useCallback(async () => {
    setLoading(true);
    const [{ data: reactionsData }, { data: balanceData }, { data: userReactions }, { data: jamData }] = await Promise.all([
      supabase.from('song_reactions').select('emoji').eq('song_id', song.id),
      user ? supabase.from('profiles').select('tickle_balance').eq('id', user.id).maybeSingle() : { data: null },
      user ? supabase.from('song_reactions').select('emoji').eq('song_id', song.id).eq('user_id', user.id) : { data: [] },
      user ? supabase.from('jamstacksongs').select('id').eq('user_id', user.id).eq('song_id', song.id).maybeSingle() : { data: null },
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
    setIsJammed(!!jamData);
    setLoading(false);
  }, [song.id, user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const handleTicklesUpdated = () => loadStats();
    window.addEventListener('ticklesUpdated', handleTicklesUpdated);
    return () => window.removeEventListener('ticklesUpdated', handleTicklesUpdated);
  }, [loadStats]);

  const handleEmojiClick = async (emoji, e) => {
    e.stopPropagation();
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

  const handleSendTickle = async (e) => {
    e.stopPropagation();
    if (!user) return toast.error('Login required');
    if ((tickleBalance ?? 0) < 1) return toast.error('Not enough Tickles');
    if (song.user_id === user.id) return toast.error('You can’t send Tickles to yourself!');

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session?.access_token) {
      return toast.error('Authorization failed');
    }
    const token = sessionData.session.access_token;

    try {
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
    } catch (err) {
      toast.error('Error sending tickle: Endpoint may be unavailable');
    }
  };

  const handleShareJam = async (e) => {
    e.stopPropagation();
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

  const handleJamToggle = async (e) => {
    e.stopPropagation();
    if (!user) return toast.error('Login to add to Jam Stack');
    setJamLoading(true);

    if (isJammed) {
      const { error } = await supabase
        .from('jamstacksongs')
        .delete()
        .eq('user_id', user.id)
        .eq('song_id', song.id);
      if (!error) {
        setStats((prev) => ({ ...prev, jams: (prev.jams || 0) - 1 }));
        setIsJammed(false);
        toast.success('Removed from Jam Stack!');
      } else {
        toast.error('Failed to remove from Jam Stack');
      }
    } else {
      const { error } = await supabase.from('jamstacksongs').insert([
        { user_id: user.id, song_id: song.id },
      ]);
      if (!error) {
        setStats((prev) => ({ ...prev, jams: (prev.jams || 0) + 1 }));
        setIsJammed(true);
        toast.success('Added to Jam Stack!');
      } else {
        toast.error('Failed to add to Jam Stack');
      }
    }

    setJamLoading(false);
  };

  const handleBuyTickles = (e) => {
    e.stopPropagation();
    navigate('/rewards');
  };

  return (
    <div className="w-full mt-2 text-sm">
      {/* Emoji Reaction Row */}
      <div className="flex justify-center items-center gap-6 text-2xl font-semibold mb-3">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={(e) => handleEmojiClick(emoji, e)}
            disabled={hasReacted[emoji]}
            className={`flex items-center gap-1 ${hasReacted[emoji] ? 'opacity-50' : 'hover:scale-110'} transition-transform`}
          >
            <span>{emoji}</span>
            <span className="text-sm">{stats[emoji] || 0}</span>
          </button>
        ))}
        <span className="text-gray-400 text-sm">👁️ {song.views || 0}</span>
        <span className="text-gray-400 text-sm">📥 {stats.jams || song.jams || 0}</span>
      </div>

      {/* Action Row 1: Jam Stack, Share - Centered */}
      <div className="flex items-center justify-center mt-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => handleJamToggle(e)}
            disabled={jamLoading || !user}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors border ${
              isJammed
                ? 'border-[#00CEC8] text-[#00CEC8] bg-black opacity-70'
                : 'border-[#00CEC8] text-white hover:bg-[#00CEC8] hover:text-black'
            }`}
          >
            {isJammed ? '🎵 In Stack' : jamLoading ? 'Adding...' : '➕ Stack This'}
          </button>
          <button
            onClick={(e) => handleShareJam(e)}
            className="text-sm font-semibold text-[#3FD6CD] border border-[#3FD6CD] px-3 py-1 rounded-full shadow flex-1 text-center"
          >
             🔗 Share Jam
          </button>
        </div>
      </div>

      {/* Action Row 2: My Tickles, Send Tickle, Buy Tickles */}
      <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2 w-full">
          <div className="px-3 py-1 text-sm rounded-full font-semibold transition bg-[#3FD6CD] text-white hover:opacity-90 flex-1 text-center"">
            🎶 Tickles: {loading ? '...' : tickleBalance}
          </div>
          <button
            onClick={(e) => handleSendTickle(e)}
            className="px-3 py-1 text-sm rounded-full font-semibold transition bg-[#FFD700] text-black hover:opacity-90 flex-1 text-center""
          >
            🎁 Send Tickle
          </button>
          <button
            onClick={(e) => handleBuyTickles(e)}
            className="px-3 py-1 text-sm rounded-full font-semibold transition bg-[#3FD6CD] text-white hover:opacity-90 flex-1 text-center""
          >
            🛒 Buy Tickles
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReactionStatsBar;

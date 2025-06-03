// ReactionStatsBar.js - Fully Functional Version (238 lines)
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useUser } from './AuthProvider';
import AddToJamStackButton from './AddToJamStackButton';
import BoostTickles from './BoostTickles';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const emojiSoundMap = {
  '🔥': 'fire.mp3',
  '💖': 'love.mp3',
  '😭': 'sad.mp3',
  '🎯': 'bullseye.mp3',
  '👁️': 'meh.mp3',
  '📥': 'add.mp3',
  '🎁': 'tickle.mp3',
};

const ReactionStatsBar = ({ songId, artistId, cover, artist, genre }) => {
  const { user } = useUser();
  const [reactions, setReactions] = useState({});
  const [userReactions, setUserReactions] = useState({});
  const [tickleBalance, setTickleBalance] = useState(0);
  const [sending, setSending] = useState(false);
  const [flash, setFlash] = useState(false);
  const [playCounted, setPlayCounted] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    if (songId) {
      fetchReactions();
      incrementView();
    }
  }, [songId]);

  useEffect(() => {
    if (user?.id && songId) {
      fetchUserReactions();
      fetchTickleBalance();
    }
  }, [user, songId]);

  const incrementView = async () => {
    if (playCounted || !songId) return;
    await supabase.rpc('increment_view_count', { song_id_input: songId });
    setPlayCounted(true);
  };

  const fetchReactions = async () => {
    const { data } = await supabase
      .from('song_reactions')
      .select('*')
      .eq('song_id', songId)
      .single();
    if (data) {
      setReactions({
        '🔥': data.fire || 0,
        '💖': data.heart || 0,
        '😭': data.cry || 0,
        '🎯': data.target || 0,
        '👁️': data.views || 0,
        '📥': data.jamstack || 0,
      });
    }
  };

  const fetchUserReactions = async () => {
    const { data } = await supabase
      .from('reactions')
      .select('emoji')
      .eq('user_id', user.id)
      .eq('song_id', songId);
    const reacted = {};
    data?.forEach(({ emoji }) => (reacted[emoji] = true));
    setUserReactions(reacted);
  };

  const fetchTickleBalance = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', user.id)
      .single();
    setTickleBalance(data?.tickle_balance || 0);
  };

  const playSound = (emoji) => {
    const file = emojiSoundMap[emoji];
    if (file) {
      const audio = new Audio(`/sounds/${file}`);
      audio.volume = 0.8;
      audio.play().catch(() => {});
      soundRef.current = audio;
    }
  };

  const triggerFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  };

  const handleReaction = async (emoji) => {
    if (!user?.id || !songId || userReactions[emoji]) return;
    const { error } = await supabase.from('reactions').insert({
      user_id: user.id,
      song_id: songId,
      emoji,
    });
    if (!error) {
      playSound(emoji);
      fetchReactions();
      fetchUserReactions();
    } else {
      toast.error('Error recording reaction');
    }
  };

  const handleSendTickle = async () => {
    if (!user?.id || !artistId || sending || tickleBalance < 1) return;
    setSending(true);
    const { error } = await supabase.rpc('spend_tickles', {
      user_id_input: user.id,
      song_id_input: songId,
      reason: '🎁',
      cost: 1,
    });
    if (!error) {
      playSound('🎁');
      fetchTickleBalance();
      triggerFlash();
      toast.success('Tickle sent!');
    } else {
      toast.error('Could not send Tickle');
    }
    setSending(false);
  };

  const renderStat = (emoji) => (
    <button
      key={emoji}
      onClick={() => handleReaction(emoji)}
      className={`text-xl mx-1 transform transition-transform duration-150 hover:scale-125 ${
        userReactions[emoji] ? 'opacity-100' : 'opacity-60 hover:opacity-100'
      }`}
    >
      {emoji} {reactions[emoji] || 0}
    </button>
  );

  return (
    <div className={`w-full text-white text-sm px-2 space-y-3 ${flash ? 'animate-pulse' : ''}`}>
      {/* Cover and Genre Banner */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow">
        <Link to={`/artist/${artistId}`}>
          <img src={cover} alt="Cover" className="w-full h-full object-cover" />
        </Link>
        {genre && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
            {genre}
          </div>
        )}
      </div>

      {/* Emoji Reactions */}
      <div className="flex justify-center items-center flex-wrap gap-3">
        {renderStat('🔥')}
        {renderStat('💖')}
        {renderStat('😭')}
        {renderStat('🎯')}
        {renderStat('👁️')}
        {renderStat('📥')}
      </div>

      {/* Main Actions */}
      <div className="flex justify-between items-center gap-2">
        <button
          onClick={() => {
            document.getElementById(`jamstack-${songId}`)?.click();
          }}
          className="flex items-center gap-1 px-3 py-1 bg-pink-500 text-white rounded-full text-sm font-semibold hover:bg-pink-600 transition"
        >
          ➕ Add Jam
        </button>

        <div className="flex items-center gap-1 px-3 py-1 bg-black bg-opacity-50 text-white rounded-full text-sm font-semibold">
          🎁 {tickleBalance} Tickles
        </div>

        <button
          onClick={handleSendTickle}
          disabled={sending || tickleBalance < 1}
          className="flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white rounded-full text-sm font-semibold hover:bg-emerald-600 disabled:opacity-40 transition"
        >
          🎁 Gift Tickle
        </button>
      </div>

      {/* Hidden JamStackButton Trigger */}
      <div className="hidden">
        <AddToJamStackButton
          songId={songId}
          user={user}
          className=""
          buttonId={`jamstack-${songId}`}
        />
      </div>

      {/* Boost */}
      <div className="flex justify-center">
        <BoostTickles
          songId={songId}
          artistId={artistId}
          onBoost={() => {
            fetchTickleBalance();
            triggerFlash();
          }}
        />
      </div>
    </div>
  );
};

export default ReactionStatsBar;

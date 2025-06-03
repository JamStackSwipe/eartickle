// src/components/ReactionStatsBar.js
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useUser } from './AuthProvider';
import AddToJamStackButton from './AddToJamStackButton';
import BoostTickles from './BoostTickles';
import { toast } from 'react-hot-toast';

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
  const soundRef = useRef(null);
  const playCountedRef = useRef(false);

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
    if (playCountedRef.current || !songId) return;
    const { error } = await supabase.rpc('increment_view_count', { song_id_input: songId });
    if (error) console.error('❌ View count failed:', error.message);
    else console.log('👁️ View incremented');
    playCountedRef.current = true;
  };

  const fetchReactions = async () => {
    const { data, error } = await supabase
      .from('song_reactions')
      .select('*')
      .eq('song_id', songId)
      .single();
    if (error) {
      console.error('❌ fetchReactions failed:', error.message);
      return;
    }
    setReactions({
      '🔥': data?.fire || 0,
      '💖': data?.heart || 0,
      '😭': data?.cry || 0,
      '🎯': data?.target || 0,
      '👁️': data?.views || 0,
      '📥': data?.jamstack || 0,
    });
  };

  const fetchUserReactions = async () => {
    const { data, error } = await supabase
      .from('reactions')
      .select('emoji')
      .eq('user_id', user.id)
      .eq('song_id', songId);
    if (error) {
      console.error('❌ fetchUserReactions failed:', error.message);
      return;
    }
    const reacted = {};
    data?.forEach(({ emoji }) => (reacted[emoji] = true));
    setUserReactions(reacted);
  };

  const fetchTickleBalance = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', user.id)
      .single();
    if (error) {
      console.error('❌ fetchTickleBalance failed:', error.message);
      return;
    }
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
    if (error) {
      console.error('❌ Reaction failed:', error.message);
      toast.error('Failed to react');
      return;
    }
    playSound(emoji);
    fetchReactions();
    fetchUserReactions();
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
    if (error) {
      console.error('❌ Tickle failed:', error.message);
      toast.error('Failed to send tickle');
    } else {
      playSound('🎁');
      triggerFlash();
      toast.success('Tickle sent!');
      fetchTickleBalance();
    }
    setSending(false);
  };

  const renderStat = (emoji) => (
    <button
      key={emoji}
      onClick={() => handleReaction(emoji)}
      className={`text-xl mx-1 transition hover:scale-125 ${
        userReactions[emoji] ? 'opacity-100' : 'opacity-60 hover:opacity-100'
      }`}
    >
      {emoji} {reactions[emoji] || 0}
    </button>
  );

  return (
    <div className={`w-full text-white text-sm px-2 space-y-3 ${flash ? 'animate-pulse' : ''}`}>
      {/* Emoji Reactions */}
      <div className="flex justify-center items-center flex-wrap gap-3">
        {renderStat('🔥')}
        {renderStat('💖')}
        {renderStat('😭')}
        {renderStat('🎯')}
        {renderStat('👁️')}
        {renderStat('📥')}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-2 h-9">
        <AddToJamStackButton
          songId={songId}
          user={user}
          className="h-9 px-3 py-1 bg-black bg-opacity-40 text-white text-sm font-semibold rounded"
        />
        <div className="flex items-center justify-center min-w-[100px] h-9 px-3 py-1 rounded bg-black bg-opacity-40 text-pink-300 text-sm font-semibold">
          🎁 {tickleBalance} Tickles
        </div>
        <button
          onClick={handleSendTickle}
          disabled={sending || tickleBalance < 1}
          className="h-9 px-3 py-1 rounded bg-black bg-opacity-40 text-white text-sm font-semibold disabled:opacity-40 hover:scale-105 transition"
        >
          🎁 Gift Tickle
        </button>
      </div>

      {/* Boost Bar */}
      <div className="flex justify-center">
        <BoostTickles
          songId={songId}
          artistId={artistId}
          onBoost={() => {
            fetchTickleBalance();
            triggerFlash();
            playSound('🎁');
          }}
        />
      </div>
    </div>
  );
};

export default ReactionStatsBar;

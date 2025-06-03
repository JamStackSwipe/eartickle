// ReactionStatsBar.js – Fully Functional + Clean Layout
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
  const soundRef = useRef(null);
  const [flash, setFlash] = useState(false);
  const [playCounted, setPlayCounted] = useState(false);

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
    console.log('👁️ Incrementing view count for', songId);
    await supabase.rpc('increment_view_count', { song_id_input: songId });
    setPlayCounted(true);
  };

  const fetchReactions = async () => {
    console.log('📊 Fetching song reactions...');
    const { data, error } = await supabase
      .from('song_reactions')
      .select('*')
      .eq('song_id', songId)
      .single();
    if (error) console.error('❌ Reactions fetch error:', error.message);
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
    console.log('🙋‍♂️ Checking user reactions...');
    const { data, error } = await supabase
      .from('reactions')
      .select('emoji')
      .eq('user_id', user.id)
      .eq('song_id', songId);
    if (error) console.error('❌ User reaction fetch error:', error.message);
    const reacted = {};
    data?.forEach(({ emoji }) => (reacted[emoji] = true));
    setUserReactions(reacted);
  };

  const fetchTickleBalance = async () => {
    console.log('💰 Fetching tickle balance...');
    const { data, error } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', user.id)
      .single();
    if (error) console.error('❌ Balance fetch error:', error.message);
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
    console.log(`🎧 Reacting with ${emoji}`);
    const { error } = await supabase.from('reactions').insert({
      user_id: user.id,
      song_id: songId,
      emoji,
    });
    if (error) {
      console.error('❌ Reaction error:', error.message);
      toast.error('Failed to react');
      return;
    }
    playSound(emoji);
    fetchReactions();
    fetchUserReactions();
  };

  const handleSendTickle = async () => {
    if (!user?.id || !artistId || sending || tickleBalance < 1) return;
    console.log('🎁 Sending tickle...');
    setSending(true);
    const { error } = await supabase.rpc('spend_tickles', {
      user_id_input: user.id,
      song_id_input: songId,
      reason: '🎁',
      cost: 1,
    });
    if (error) {
      console.error('❌ Send tickle error:', error.message);
      toast.error('Could not send tickle');
      setSending(false);
      return;
    }
    playSound('🎁');
    fetchTickleBalance();
    triggerFlash();
    setSending(false);
    toast.success('Tickle sent!');
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

      {/* Actions Row */}
      <div className="flex items-center justify-between gap-2 h-8">
        <AddToJamStackButton
          songId={songId}
          user={user}
          className="h-8 px-3 py-1 bg-black bg-opacity-40 text-white rounded"
        />
        <div className="flex items-center justify-center min-w-[100px] h-8 px-3 py-1 rounded bg-black bg-opacity-40 text-pink-300">
          🎁 {tickleBalance} Tickles
        </div>
        <button
          onClick={handleSendTickle}
          disabled={sending || tickleBalance < 1}
          className="h-8 px-3 py-1 rounded bg-black bg-opacity-40 text-white disabled:opacity-40 hover:scale-105 transition"
        >
          🎁 Gift Tickle
        </button>
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

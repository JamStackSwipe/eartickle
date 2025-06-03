import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from './AuthProvider';
import AddToJamStackButton from './AddToJamStackButton';
import BoostTickles from './BoostTickles';

const ReactionStatsBar = ({ songId, artistId }) => {
  const { user } = useUser();
  const [reactions, setReactions] = useState({});
  const [userReactions, setUserReactions] = useState({});
  const [tickleBalance, setTickleBalance] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (songId) {
      fetchReactions();
    }
  }, [songId]);

  useEffect(() => {
    if (user?.id && songId) {
      fetchUserReactions();
      fetchTickleBalance();
    }
  }, [user, songId]);

  const fetchReactions = async () => {
    if (!songId) return;
    const { data, error } = await supabase
      .from('song_reactions')
      .select('*')
      .eq('song_id', songId)
      .single();

    if (!error && data) {
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
    if (!user?.id || !songId) return;
    const { data } = await supabase
      .from('reactions')
      .select('emoji')
      .eq('user_id', user.id)
      .eq('song_id', songId);

    const reacted = {};
    data?.forEach(({ emoji }) => {
      reacted[emoji] = true;
    });
    setUserReactions(reacted);
  };

  const fetchTickleBalance = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', user.id)
      .single();

    if (data) {
      setTickleBalance(data.tickle_balance || 0);
    }
  };

  const playSound = (emoji) => {
    const map = {
      '🔥': 'fire.mp3',
      '💖': 'love.mp3',
      '😭': 'sad.mp3',
      '🎯': 'bullseye.mp3',
      '👁️': 'meh.mp3',
      '📥': 'add.mp3',
      '🎁': 'tickle.mp3',
    };
    const file = map[emoji];
    if (file) {
      new Audio(`/sounds/${file}`).play().catch(() => {});
    }
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
    }

    setSending(false);
  };

  const renderStat = (emoji) => (
    <button
      key={emoji}
      onClick={() => handleReaction(emoji)}
      className={`text-xl mx-1 cursor-pointer transition-transform duration-150 ${
        userReactions[emoji] ? 'opacity-100' : 'opacity-60 hover:opacity-100'
      }`}
    >
      {emoji} {reactions[emoji] || 0}
    </button>
  );

  return (
    <div className="w-full text-sm text-white mt-2 px-2 space-y-2">

      {/* Emoji Row */}
      <div className="flex justify-center items-center space-x-3 text-lg">
        {renderStat('🔥')}
        {renderStat('💖')}
        {renderStat('😭')}
        {renderStat('🎯')}
        {renderStat('👁️')}
        {renderStat('📥')}
      </div>

      {/* Button Row */}
      <div className="flex items-center justify-between gap-x-2 text-sm h-8">
        <AddToJamStackButton
          songId={songId}
          user={user}
          className="h-8 px-3 py-1 rounded-md bg-black bg-opacity-40 text-white text-sm"
        />
        <div className="flex items-center justify-center min-w-[100px] h-8 px-3 py-1 rounded-md bg-black bg-opacity-40 text-pink-300 text-sm">
          🎁 {tickleBalance} Tickles
        </div>
        <button
          onClick={handleSendTickle}
          disabled={sending || tickleBalance < 1}
          className="h-8 px-3 py-1 rounded-md bg-black bg-opacity-40 text-white text-sm disabled:opacity-50 hover:scale-105 transition"
        >
          🎁 Gift Tickle
        </button>
      </div>

      {/* Boost */}
      <div className="flex justify-center">
        <BoostTickles
          songId={songId}
          artistId={artistId}
          onBoost={fetchTickleBalance}
        />
      </div>
    </div>
  );
};

export default ReactionStatsBar;

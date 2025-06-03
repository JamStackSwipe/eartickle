import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from './AuthProvider';
import BoostTickles from './BoostTickles';
import AddToJamStackButton from './AddToJamStackButton';

const ReactionStatsBar = ({ songId, artistId }) => {
  const { user } = useUser();
  const [reactions, setReactions] = useState({});
  const [userReactions, setUserReactions] = useState({});
  const [tickleBalance, setTickleBalance] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (songId) {
      fetchReactions();
      fetchUserReactions();
    }
  }, [songId]);

  useEffect(() => {
    if (user?.id) fetchTickleBalance();
  }, [user]);

  const fetchReactions = async () => {
    const { data, error } = await supabase
      .from('song_reactions')
      .select('*')
      .eq('song_id', songId);
    if (!error) {
      const grouped = {};
      data.forEach(({ emoji }) => {
        grouped[emoji] = (grouped[emoji] || 0) + 1;
      });
      setReactions(grouped);
    }
  };

  const fetchUserReactions = async () => {
    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('user_id', user?.id)
      .eq('song_id', songId);
    if (!error) {
      const userEmojis = {};
      data.forEach(({ emoji }) => {
        userEmojis[emoji] = true;
      });
      setUserReactions(userEmojis);
    }
  };

  const fetchTickleBalance = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', user?.id)
      .single();
    if (!error && data) {
      setTickleBalance(data.tickle_balance || 0);
    }
  };

  const playSound = (emoji) => {
    let filename = null;
    switch (emoji) {
      case '🔥': filename = 'fire.mp3'; break;
      case '💖': filename = 'love.mp3'; break;
      case '😭': filename = 'sad.mp3'; break;
      case '🎯': filename = 'bullseye.mp3'; break;
      case '👁️': filename = 'meh.mp3'; break;
      case '📥': filename = 'add.mp3'; break;
      case '🎁': filename = 'tickle.mp3'; break;
      default: return;
    }
    new Audio(`/sounds/${filename}`).play().catch(() => {});
  };

  const handleReaction = async (emoji) => {
    if (!user || userReactions[emoji]) return;

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
    if (!user || !artistId || sending || tickleBalance < 1) return;

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
      className={`text-xl mx-1 ${userReactions[emoji] ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
    >
      {emoji} {reactions[emoji] || 0}
    </button>
  );

  return (
    <div className="w-full text-sm text-white mt-2 px-2 space-y-2">
      <div className="flex items-center justify-between">
        <AddToJamStackButton songId={songId} />
        <div className="text-center text-xs text-pink-300">
          🎁 {tickleBalance} Tickles
        </div>
        <button
          onClick={handleSendTickle}
          disabled={sending || tickleBalance < 1}
          className="text-lg disabled:opacity-50 hover:scale-110 transition"
        >
          🎁 Send Tickle
        </button>
      </div>

      <div className="flex justify-center items-center space-x-3 text-lg">
        {renderStat('🔥')}
        {renderStat('💖')}
        {renderStat('😭')}
        {renderStat('🎯')}
        {renderStat('👁️')}
        {renderStat('📥')}
      </div>

      <div className="flex justify-center">
        <BoostTickles songId={songId} artistId={artistId} onBoost={fetchTickleBalance} />
      </div>
    </div>
  );
};

export default ReactionStatsBar;

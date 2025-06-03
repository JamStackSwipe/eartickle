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
      className={`text-xl mx-1 cursor-pointer transition-transform duration-150 ${
        userReactions[emoji] ? 'opacity-100' : 'opacity-60 hover:opacity-100'
      }`}
    >
      {emoji} {reactions[emoji] || 0}
    </button>
  );

  return (
    <div className="w-full text-sm text-white mt-2 px-2 space-y-2">

      <div className="flex items-center justify-between space-x-2 text-sm h-8">
        <div className="flex-1">
          <AddToJamStackButton
            songId={songId}
            className="w-full h-8 px-3 py-1 rounded-md bg-black bg-opacity-40 text-white text-sm"
          />
        </div>

        <div className="flex items-center justify-center flex-shrink-0 min-w-[100px] h-8 px-3 py-1 rounded-md bg-black bg-opacity-40 text-pink-300 text-sm">
          🎁 {tickleBalance} Tickles
        </div>

        <div className="flex-1 text-right">
          <button
            onClick={handleSendTickle}
            disabled={sending || tickleBalance < 1}
            className="h-8 px-3 py-1 rounded-md bg-black bg-opacity-40 text-white text-sm disabled:opacity-50 hover:scale-105 transition"
          >
            🎁 Send Tickle
          </button>
        </div>
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

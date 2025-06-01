// src/components/ReactionStatsBar.js
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from './AuthProvider';
import { playTickle } from '../utils/tickleSound';

const EMOJIS = [
  { icon: '🔥', field: 'fires' },
  { icon: '❤️', field: 'loves' },
  { icon: '😢', field: 'sads' },
  { icon: '🎯', field: 'bullseyes' },
];

const ReactionStatsBar = ({ song }) => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    fires: song.fires || 0,
    loves: song.loves || 0,
    sads: song.sads || 0,
    bullseyes: song.bullseyes || 0,
  });
  const [confirmation, setConfirmation] = useState({ show: false, emoji: null });

  const handleReaction = async (emoji) => {
    if (!user) return alert('Please log in to react.');

    const field = EMOJIS.find((e) => e.icon === emoji)?.field;
    if (!field) return;

    await supabase.from('song_reactions').insert({
      user_id: user.id,
      song_id: song.id,
      emoji,
    });

    setStats((prev) => ({ ...prev, [field]: prev[field] + 1 }));
    setConfirmation({ emoji, show: true });
  };

  const handleSendTickle = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', user.id)
      .single();

    if ((profile?.tickle_balance || 0) < 1) {
      alert('Not enough Tickles. Visit Rewards to buy more.');
      setConfirmation({ show: false, emoji: null });
      return;
    }

    const { error } = await supabase.from('rewards').insert({
      sender_id: user.id,
      receiver_id: song.user_id,
      song_id: song.id,
      amount: 1,
      emoji: confirmation.emoji,
    });

    if (!error) {
      playTickle();
      alert('1 Tickle sent!');
    } else {
      alert('Failed to send Tickle');
    }

    setConfirmation({ show: false, emoji: null });
  };

  return (
    <div className="mt-2 flex items-center flex-wrap gap-4 text-lg">
      {EMOJIS.map(({ icon, field }) => (
        <button
          key={icon}
          onClick={() => handleReaction(icon)}
          className="flex items-center space-x-1 hover:scale-110 transition-transform"
        >
          <span>{icon}</span>
          <span className="text-sm text-gray-600">{stats[field]}</span>
        </button>
      ))}

      {confirmation.show && (
        <div className="ml-4 bg-purple-100 text-sm p-2 rounded shadow">
          <p>
            Send 1 Tickle with your {confirmation.emoji}?&nbsp;
            <button
              onClick={handleSendTickle}
              className="ml-2 bg-purple-600 text-white px-2 py-1 rounded"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmation({ show: false, emoji: null })}
              className="ml-2 px-2 py-1"
            >
              Cancel
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default ReactionStatsBar;

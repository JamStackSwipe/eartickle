// components/AddToJamStackButton.js – Neon migration (fetch API); deprecated? Move to ReactionStatsBar if so
'use client';

import React, { useState, useEffect } from 'react';

const AddToJamStackButton = ({ songId, user }) => {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkIfInJamStack = async () => {
      if (!user || !songId) return;
      try {
        const res = await fetch(`/api/jamstack/check?user_id=${user.id}&song_id=${songId}`);
        const { data } = await res.json();
        if (data) setAdded(true);
      } catch (error) {
        console.error('JamStack check error:', error.message);
      }
    };
    checkIfInJamStack();
  }, [user, songId]);

  const handleAddToJamStack = async () => {
    if (!user || !songId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/jamstack/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, song_id: songId }),
      });
      if (res.ok) {
        console.log('✅ Song added to JamStack!');
        setAdded(true);
      } else {
        console.error('Error adding to JamStack');
      }
    } catch (error) {
      console.error('Error adding to JamStack:', error.message);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleAddToJamStack}
      disabled={loading || added}
      className={`px-3 py-1 text-sm font-medium rounded-full transition-colors border ${
        added
          ? 'border-[#00CEC8] text-[#00CEC8] bg-black opacity-70 cursor-not-allowed'
          : 'border-[#00CEC8] text-white hover:bg-[#00CEC8] hover:text-black'
      }`}
    >
      {added ? '🎵 In Stack' : loading ? 'Adding...' : '➕ Stack This'}
    </button>
  );
};

export default AddToJamStackButton;

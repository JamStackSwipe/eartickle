// src/components/AddToJamStackButton.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AddToJamStackButton = ({ songId, user }) => {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkIfInJamStack = async () => {
      if (!user || !songId) return;

      const { data, error } = await supabase
        .from('jamstacksongs')
        .select('id')
        .eq('user_id', user.id)
        .eq('song_id', songId)
        .maybeSingle();

      if (data) setAdded(true);
      if (error) console.error('JamStack check error:', error.message);
    };

    checkIfInJamStack();
  }, [user, songId]);

  const handleAddToJamStack = async () => {
    if (!user || !songId) return;
    setLoading(true);

    const { error } = await supabase.from('jamstacksongs').insert([
      { user_id: user.id, song_id: songId },
    ]);

    if (!error) {
      console.log('✅ Song added to JamStack!');
      setAdded(true);
    } else {
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

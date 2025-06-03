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
      className={`px-4 py-1.5 text-sm font-semibold rounded-full shadow transition-all duration-200 ${
        added
          ? 'bg-[#00CEC8] text-black opacity-80 cursor-not-allowed'
          : 'bg-black border border-[#00CEC8] text-[#00CEC8] hover:bg-[#00CEC8] hover:text-black'
      }`}
    >
      {added ? '✅ In Stack' : loading ? 'Adding...' : '➕ Stack This'}
    </button>
  );
};

export default AddToJamStackButton;

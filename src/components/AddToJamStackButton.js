import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AddToJamStackButton = ({ songId, user }) => {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔍 Check if the song is already in JamStack when component mounts
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

    if (error) {
      console.error('Error adding to JamStack:', error.message);
    } else {
      console.log('✅ Song added to JamStack!');
      setAdded(true);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleAddToJamStack}
      disabled={loading || added}
      className={`px-4 py-2 mt-2 text-sm font-semibold rounded ${
        added
          ? 'bg-green-400 text-white cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`}
    >
      {added ? '✅ In JamStack' : loading ? 'Adding...' : '➕ Add to JamStack'}
    </button>
  );
};

export default AddToJamStackButton;

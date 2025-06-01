import React, { useState } from 'react';
import { supabase } from '../supabase';

const AddToJamStackButton = ({ songId, user }) => {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddToJamStack = async () => {
    if (!user || !songId) return;
    setLoading(true);

    const { data: existing, error: checkError } = await supabase
      .from('jamstacksongs')
      .select('id')
      .eq('user_id', user.id)
      .eq('song_id', songId);

    if (checkError) {
      console.error('Error checking JamStack:', checkError.message);
      setLoading(false);
      return;
    }

    if (existing.length > 0) {
      console.log('Song already in JamStack.');
      setAdded(true);
      setLoading(false);
      return;
    }

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

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AddToJamStackButton = ({ songId, user, className = '' }) => {
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
      className={`px-3 py-1 rounded text-sm font-medium transition-all shadow-sm ${
        added
          ? 'bg-green-500 text-white cursor-not-allowed'
          : 'bg-black border border-yellow-400 text-yellow-300 hover:bg-yellow-500 hover:text-black'
      } ${className}`}
    >
      {added ? '✅ In JamStack' : loading ? 'Adding...' : '➕ Add to JamStack'}
    </button>
  );
};

export default AddToJamStackButton;

import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from './AuthProvider';

const AddToJamStackButton = ({ songId }) => {
  const { user } = useUser();
  const [isInJamStack, setIsInJamStack] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !songId) return;

    const check = async () => {
      const { data, error } = await supabase
        .from('jamstacksongs')
        .select('id')
        .eq('user_id', user.id)
        .eq('song_id', songId)
        .single();

      setIsInJamStack(!!data);
      setLoading(false);
    };

    check();
  }, [user, songId]);

  const handleAdd = async () => {
    if (!user || !songId) return;

    const { error } = await supabase
      .from('jamstacksongs')
      .insert([{ user_id: user.id, song_id: songId }]);

    if (error) {
      alert('❌ Error adding to JamStack.');
    } else {
      setIsInJamStack(true);
      alert('✅ Added to your JamStack!');
    }
  };

  if (loading) return null;

  return (
    <button
      onClick={handleAdd}
      disabled={isInJamStack}
      className={`w-full py-2 mt-2 rounded font-semibold ${
        isInJamStack
          ? 'bg-gray-500 text-white cursor-not-allowed'
          : 'bg-green-600 text-white hover:bg-green-700'
      }`}
    >
      {isInJamStack ? '✔️ In JamStack' : '❤️ Add to JamStack'}
    </button>
  );
};

export default AddToJamStackButton;

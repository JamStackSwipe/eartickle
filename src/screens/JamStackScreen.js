// src/screens/JamStackScreen.js
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import JamStackView from './JamStackView';

const JamStackScreen = () => {
  const { user } = useUser();
  const [jamstack, setJamstack] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJamstack = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('jamstacksongs')
        .select(`
          id,
          song_id,
          songs (
            id,
            title,
            artist,
            cover,
            audio,
            user_id,
            stripe_account_id
          )
        `)
        .eq('user_id', user.id)
        .order('id', { ascending: false });

      if (error) {
        console.error('❌ Error fetching JamStack:', error.message);
      } else {
        setJamstack(data);
      }

      setLoading(false);
    };

    fetchJamstack();
  }, [user]);

  return (
    <div className="p-4 min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">🎧 My JamStack</h1>
      {loading ? (
        <p>Loading your saved songs...</p>
      ) : (
        <JamStackView jamstack={jamstack} />
      )}
    </div>
  );
};

export default JamStackScreen;

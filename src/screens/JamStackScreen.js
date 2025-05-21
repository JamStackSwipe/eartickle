// src/screens/JamStackScreen.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../components/AuthProvider';
import JamStackView from '../components/JamStackView';

const JamStackScreen = () => {
  const { user } = useUser();
  const [jamstack, setJamstack] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJamstack = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('jamstack')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error fetching jamstack:', error.message);
      } else {
        setJamstack(data);
      }

      setLoading(false);
    };

    fetchJamstack();
  }, [user]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🎧 My JamStack</h1>
      {loading ? <p>Loading...</p> : <JamStackView jamstack={jamstack} />}
    </div>
  );
};

export default JamStackScreen;


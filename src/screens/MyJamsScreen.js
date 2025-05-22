import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../components/AuthProvider';
import JamStackView from '../components/JamStackView';

const MyJamsScreen = () => {
  const { user } = useUser();
  const [jams, setJams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyJams = async () => {
      if (!user) return;

      console.log('🔍 Fetching JamStack songs for user:', user.id);

      const { data, error } = await supabase
        .from('jamstacksongs')
        .select(`
          id,
          created_at,
          song_id,
          songs (
            id,
            title,
            artist,
            cover
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Error fetching JamStack songs:', error);
      } else {
        console.log('✅ JamStack songs fetched:', data);
        setJams(data);
      }

      setLoading(false);
    };

    fetchMyJams();
  }, [user]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🎧 My JamStack</h1>
      {loading ? <p>Loading...</p> : <JamStackView jamstack={jams} />}
    </div>
  );
};

export default MyJamsScreen;

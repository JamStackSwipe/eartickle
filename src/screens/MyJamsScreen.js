import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../components/AuthProvider';
import JamStackView from './JamStackView'; // ✅ CORRECT, same folder



const MyJamsScreen = () => {
  const { user } = useUser();
  const [jams, setJams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyJams = async () => {
      if (!user) return;

      console.log('✅ MyJamsScreen is LIVE');

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
        .limit(20);

      if (error) {
        console.error('❌ Error fetching JamStack songs:', error);
      } else {
        setJams(data);
      }

      setLoading(false);
    };

    fetchMyJams();
  }, [user]);

  return (
    <div className="min-


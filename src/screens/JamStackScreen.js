import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../components/AuthProvider';

const MyJamsScreen = () => {
  const { user, loading: authLoading } = useAuth();
  const [jams, setJams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      fetchMyJams();
    }
  }, [authLoading, user]);

  const fetchMyJams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jamstacksongs')
      .select('id, song_id, songs (title, artist, cover)')
      .eq('user_id', user.id);

    if (error) {
      console.error(error);
      setError('Failed to load your JamStack.');
    } else {
      setJams(data);
    }

    setLoading(false);
  };

  if (authLoading || loading) {
    return <p className="text-center mt-10">Loading your Jams...</p>;
  }

  if (!user) {
    return <p className="text-center mt-10">Please log in to view your JamStack.</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">My JamStack</h2>

      {jams.length === 0 ? (
        <p className="text-center text-gray-500">You haven't added any jams yet.</p>
      ) : (
        <ul className="space-y-4">
          {jams.map((jam) => (
            <li key={jam.id} className="p-4 bg-white rounded shadow flex items-center space-x-4">
              <img
                src={jam.songs?.cover || '/logo.png'}
                alt="Cover"
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <p className="font-semibold">{jam.songs?.title}</p>
                <p className="text-sm text-gray-500">{jam.songs?.artist}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyJamsScreen;

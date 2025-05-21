import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const JamStackScreen = () => {
  const [jamstack, setJamstack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJamStack = async () => {
      setLoading(true);
      setError('');

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        setError('User not logged in.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('jamstacksongs')
        .select('id, order, songs(*)')
        .eq('user_id', userId)
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching JamStack:', error.message);
        setError('Could not load your JamStack.');
      } else {
        setJamstack(data);
      }

      setLoading(false);
    };

    fetchJamStack();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🎵 Your JamStack</h1>

      {loading && <p className="text-gray-400">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && jamstack.length === 0 && (
        <p className="text-gray-400">You haven't stacked any songs yet.</p>
      )}

      <div className="space-y-6">
        {jamstack.map((entry, index) => (
          <div key={entry.id} className="bg-gray-900 p-4 rounded shadow flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <img
              src={entry.songs?.cover_url}
              alt={entry.songs?.title}
              className="w-24 h-24 object-cover rounded mb-4 sm:mb-0"
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{entry.songs?.title}</h2>
              <p className="text-sm text-gray-400">{entry.songs?.artist}</p>
              <audio controls src={entry.songs?.mp3_url} className="w-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JamStackScreen;

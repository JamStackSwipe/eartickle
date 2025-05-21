import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const JamStackScreen = () => {
  const [jamstack, setJamstack] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJamStack = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { data, error } = await supabase
        .from('jamstack')
        .select('id, title')
        .eq('user_id', userId);

      if (!error) setJamstack(data || []);
      setLoading(false);
    };

    loadJamStack();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">🎵 Your JamStack</h1>

      {loading ? (
        <p>Loading...</p>
      ) : jamstack.length === 0 ? (
        <p>No JamStack created yet.</p>
      ) : (
        <ul className="space-y-4">
          {jamstack.map((item) => (
            <li key={item.id} className="bg-gray-800 p-4 rounded">
              {item.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JamStackScreen;

// src/screens/RewardsScreen.js

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase'; // ✅ Your actual supabase.js import
import { useUser } from '../components/AuthProvider'; // ✅ Your working context

const RewardsScreen = () => {
  const { user } = useUser();
  const [tickles, setTickles] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickles = async () => {
      if (!user) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('tickles')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error fetching tickles:', error.message);
        setTickles(0);
      } else {
        setTickles(data?.tickles || 0);
      }

      setLoading(false);
    };

    fetchTickles();
  }, [user]);

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">🎁 My Tickles</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="text-5xl font-extrabold text-green-500">
          {tickles}
        </div>
      )}
    </div>
  );
};

export default RewardsScreen;

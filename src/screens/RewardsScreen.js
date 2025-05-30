// /src/screens/RewardsScreen.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase'; // ✅ this is your supabase.js file
import { useUser } from '../components/AuthProvider';

const RewardsScreen = () => {
  const { user } = useUser();
  const [tickles, setTickles] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTickles = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('tickle_purchases')
      .select('amount')
      .eq('user_id', user.id)
      .eq('completed', true);

    if (error) {
      console.error('❌ Error fetching tickles:', error);
      setTickles(0);
    } else {
      const total = data.reduce((sum, row) => sum + (row.amount || 0), 0);
      setTickles(total);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTickles();
  }, [user]);

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">🎁 Your Tickles</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <p className="text-2xl">💰 {tickles} Tickles</p>
      )}
    </div>
  );
};

export default RewardsScreen;

// src/screens/RewardsScreen.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const RewardsScreen = () => {
  const { user } = useUser();
  const [tickles, setTickles] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchRewards();
    }
  }, [user]);

  const fetchBalance = async () => {
    try {
      const { data: purchases } = await supabase
        .from('tickle_purchases')
        .select('amount')
        .eq('buyer_id', user.id)
        .eq('completed', true);

      const { data: sent } = await supabase
        .from('rewards')
        .select('amount')
        .eq('sender_id', user.id);

      const totalPurchased = purchases?.reduce((sum, row) => sum + (row.amount || 0), 0) || 0;
      const totalSent = sent?.reduce((sum, row) => sum + (row.amount || 0), 0) || 0;

      setTickles(totalPurchased - totalSent);
    } catch (err) {
      console.error('Balance error:', err);
    }
  };

  const fetchRewards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setError('Could not load rewards.');
    } else {
      setRewards(data);
    }

    setLoading(false);
  };

  const handleBuy = async (amount) => {
    const session = await supabase.auth.getSession();
    const token = session.data.session.access_token;

    const res = await fetch('/api/create-stripe-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: user.id, amount }),
    });

    const data = await res.json();
    if (data?.url) window.location.href = data.url;
    else alert('Stripe session failed.');
  };

  if (!user) return <p className="text-center mt-10">Log in to view Tickles.</p>;
  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-bold text-center mb-6">🎁 My Tickles</h2>

      <div className="text-center mb-6">
        <p className="text-lg">Available:</p>
        <p className="text-3xl font-bold text-purple-600">{tickles} Tickles</p>

        <div className="mt-4 space-x-2">
          {[5, 10, 25].map((amt) => (
            <button
              key={amt}
              onClick={() => handleBuy(amt)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Buy {amt} for ${amt}
            </button>
          ))}
        </div>
      </div>

      <hr className="my-6" />

      <h3 className="text-xl font-semibold mb-4 text-center">Received Tickles</h3>

      {error && <p className="text-center text-red-500">{error}</p>}
      {rewards.length === 0 ? (
        <p className="text-center text-gray-500">You haven’t been tickled yet 😢</p>
      ) : (
        <ul className="space-y-4">
          {rewards.map((r) => (
            <li key={r.id} className="p-4 bg-white border rounded shadow">
              <p className="text-lg">🎉 {r.amount} Tickles</p>
              <p className="text-sm text-gray-600">
                From: {r.sender_id?.slice(0, 8)}<br />
                Song: {r.song_id?.slice(0, 8)}<br />
                {new Date(r.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RewardsScreen;

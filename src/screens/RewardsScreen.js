import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import { playTickle, playTickleSpecial } from '../utils/tickleSound';

const RewardsScreen = () => {
  const { user } = useUser();
  const [tickles, setTickles] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTickles();
      fetchRewards();
    }
  }, [user]);

  const fetchTickles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('tickles')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('❌ Error fetching tickle balance from profile:', error);
    setTickles(0);
  } else {
    setTickles(data.tickles || 0);
  }
};


    const total = data.reduce((sum, row) => sum + (row.amount || 0), 0);
    setTickles(total);
  };

  const fetchRewards = async () => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching rewards:', error);
      return;
    }

    setRewards(data);
    if (data.length > 0) {
      const latest = data[0];
      if (latest.amount >= 20) playTickleSpecial();
      else playTickle();
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
      body: JSON.stringify({
        user_id: user.id,
        amount,
      }),
    });

    const data = await res.json();
    if (data?.url) window.location.href = data.url;
    else alert('⚠️ Failed to create Stripe session');
  };

  if (!user) return <p className="text-center mt-10">Please log in to view your Tickles.</p>;
  if (loading) return <p className="text-center mt-10">Loading Tickles...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">🎁 My Tickles & Balance</h2>

      <div className="mb-6 text-center">
        <p className="text-lg mb-2">Your current balance:</p>
        <p className="text-3xl font-bold text-purple-700">{tickles} Tickles</p>

        <div className="mt-4 space-x-3">
          {[5, 10, 25].map((amount) => (
            <button
              key={amount}
              onClick={() => handleBuy(amount)}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded text-sm"
            >
              Buy {amount} for ${amount}
            </button>
          ))}
        </div>
      </div>

      <hr className="my-6" />
      <h3 className="text-xl font-semibold mb-4 text-center">Received Tickles</h3>

      {rewards.length === 0 ? (
        <p className="text-center text-gray-500">You haven’t been tickled yet 😢</p>
      ) : (
        <ul className="space-y-4">
          {rewards.map((reward) => {
            const pts = reward.amount || 0;
            let icon = '🪙';
            let message = 'A tiny tickle!';

            if (pts >= 5 && pts < 10) {
              icon = '🎧';
              message = 'You got someone grooving 🎶';
            } else if (pts >= 10 && pts < 20) {
              icon = '💎';
              message = 'You made someone laugh out loud!';
            } else if (pts >= 20) {
              icon = '👑';
              message = 'Your jam tickled ears all the way to the moon 🚀';
            }

            return (
              <li key={reward.id} className="p-4 bg-white rounded shadow border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl">{icon} {pts} Tickles</p>
                    <p className="text-sm text-gray-600">
                      From: {reward.sender_id?.slice(0, 8) || 'Unknown'}<br />
                      Song: {reward.song_id?.slice(0, 8) || '—'}<br />
                      {new Date(reward.created_at).toLocaleString()}
                    </p>
                    {pts >= 1 && <p className="mt-2 text-green-600 italic">{message}</p>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RewardsScreen;

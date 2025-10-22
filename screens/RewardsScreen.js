// screens/RewardsScreen.js – Neon migration (NextAuth + fetch API)
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { playTickle, playTickleSpecial } from '../utils/tickleSound'; // Fixed path

const RewardsScreen = () => {
  const { data: session } = useSession();
  const [tickles, setTickles] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchTickles();
      fetchRewards();
    }
  }, [session?.user?.id]);

  const fetchTickles = async () => {
    try {
      const res = await fetch(`/api/profiles/${session.user.id}/balance`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTickles(data.tickle_balance || 0);
    } catch (error) {
      console.error('Tickle balance error:', error);
    }
  };

  const fetchRewards = async () => {
    try {
      const res = await fetch(`/api/rewards?receiver_id=${session.user.id}&sort=created_at desc`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRewards(data);
      if (data.length > 0) {
        const latest = data[0];
        if (latest.amount >= 20) playTickleSpecial();
        else playTickle();
      }
    } catch (error) {
      console.error('Rewards error:', error);
    }
    setLoading(false);
  };

  const handleBuy = async (amount) => {
    try {
      const res = await fetch('/api/create-stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: session.user.id, amount }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error('Failed to create Stripe session');
    } catch (error) {
      toast.error('Buy failed');
    }
  };

  if (!session) return <p className="text-center mt-10">Please log in to view your Tickles.</p>;
  if (loading) return <p className="text-center mt-10">Loading Tickles...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-purple-600">🎁 Tickles</h2>
      <div className="mb-6 text-center">
        <p className="text-lg mb-2">Your current balance:</p>
        <p className="text-4xl font-extrabold text-yellow-500 shadow-sm">{tickles} Tickles</p>
        <div className="mt-6 flex justify-center gap-4">
          {[5, 10, 25].map((amount) => (
            <button
              key={amount}
              onClick={() => handleBuy(amount)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-4 rounded-full text-sm shadow-md"
            >
              Buy {amount} for ${amount}
            </button>
          ))}
        </div>
      </div>
      <hr className="my-8 border-gray-300" />
      <h3 className="text-2xl font-semibold mb-4 text-center">Recent Tickles Received</h3>
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
              <li key={reward.id} className="p-4 bg-white rounded-xl shadow border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xl font-bold">{icon} {pts} Tickles</p>
                    <p className="text-sm text-gray-600 mt-1">
                      From: <span className="font-mono">{reward.sender_id?.slice(0, 8) || 'Unknown'}</span><br />
                      Song: <span className="font-semibold">{reward.songs?.title || '—'}</span><br />
                      {new Date(reward.created_at).toLocaleString()}
                    </p>
                    <p className="mt-2 text-green-600 italic">{message}</p>
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

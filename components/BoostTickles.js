// components/BoostTickles.js – Neon migration (NextAuth session)
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { playTickleSent } from './utils/tickleSound'; // Fixed path

const boostOptions = [
  { amount: 5, label: '⚡ Boost 5', color: 'bg-yellow-400 text-black hover:bg-yellow-500' },
  { amount: 10, label: '🚀 Mega 10', color: 'bg-pink-500 text-white hover:bg-pink-600' },
  { amount: 25, label: '🌟 Super 25', color: 'bg-purple-600 text-white hover:bg-purple-700' },
];

const BoostTickles = ({ songId, userId, artistId }) => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const handleBoost = async (amount, reason) => {
    setLoading(true);
    try {
      if (!session) {
        toast.error('Not logged in');
        setLoading(false);
        return;
      }
      const token = session.accessToken || session.user.token; // NextAuth token
      const res = await fetch('/api/boost-tickles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          artist_id: artistId,
          song_id: songId,
          amount,
          reason,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`${amount} Tickles used!`);
        playTickleSent();
        const card = document.querySelector(`[data-song-id="${songId}"]`);
        if (card) {
          card.classList.add('animate-boost');
          setTimeout(() => card.classList.remove('animate-boost'), 1000);
        }
        window.dispatchEvent(new CustomEvent('ticklesUpdated'));
      } else {
        toast.error(result.error || 'Boost failed');
      }
    } catch (err) {
      toast.error('Unexpected error');
      console.error('❌ BoostTickles error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="mt-3 flex justify-center">
      <div className="flex flex-wrap justify-center gap-2">
        {boostOptions.map(({ amount, label, color }) => (
          <button
            key={amount}
            onClick={() => handleBoost(amount, label)}
            disabled={loading}
            className={`px-3 py-1 text-sm rounded-full font-semibold transition ${color} ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BoostTickles;

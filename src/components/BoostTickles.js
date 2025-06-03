// src/components/BoostTickles.js

import { useState } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import { playTickleSpecial } from '../utils/tickleSound';

const boostOptions = [
  { amount: 5, label: '1 Hour Boost', color: 'bg-yellow-400 hover:bg-yellow-300' },
  { amount: 10, label: '3 Hour Boost', color: 'bg-pink-400 hover:bg-pink-300' },
  { amount: 25, label: 'All Day Boost', color: 'bg-purple-500 hover:bg-purple-400' },
];

const BoostTickles = ({ songId, userId }) => {
  const [loading, setLoading] = useState(false);

  const handleBoost = async (amount, label) => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      toast.error('Not logged in');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/spend-tickle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        song_id: songId,
        user_id: userId,
        cost: amount,
        reason: 'boost',
      }),
    });

    const result = await res.json();

    if (res.ok) {
      playTickleSpecial();
      toast.success(`${label} activated!`);

      // Flash the song card
      const el = document.querySelector(`[data-song-id="${songId}"]`);
      if (el) {
        el.classList.add('animate-boost');
        el.dispatchEvent(new Event('boosted'));
        setTimeout(() => el.classList.remove('animate-boost'), 1000);
      }
    } else {
      toast.error(result.error || 'Boost failed');
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {boostOptions.map(({ amount, label, color }) => (
        <button
          key={amount}
          onClick={() => handleBoost(amount, label)}
          disabled={loading}
          className={`px-3 py-1 text-sm rounded-full font-semibold transition-all hover:scale-105 ${color} ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          🚀 {label}
        </button>
      ))}
    </div>
  );
};

export default BoostTickles;

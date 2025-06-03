// src/components/BoostTickles.js

import React, { useState } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import { playTickleSpecial } from '../utils/tickleSound';

const boostOptions = [
  { amount: 5, label: '⚡ Boost 5', color: 'bg-yellow-400 text-black hover:bg-yellow-500' },
  { amount: 10, label: '🚀 Mega 10', color: 'bg-pink-500 text-white hover:bg-pink-600' },
  { amount: 25, label: '🌟 Super 25', color: 'bg-purple-600 text-white hover:bg-purple-700' },
];

const BoostTickles = ({ songId, userId }) => {
  const [loading, setLoading] = useState(false);

  const handleBoost = async (amount, reason) => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      toast.error('Not logged in');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/send-tickle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        artist_id: userId,
        song_id: songId,
        emoji: reason, // using label as emoji
      }),
    });

    const result = await res.json();
    if (res.ok) {
      toast.success(`${amount} Tickles used!`);
      playTickleSpecial();
      const card = document.querySelector(`[data-song-id="${songId}"]`);
      if (card) {
        card.classList.add('animate-boost');
        setTimeout(() => card.classList.remove('animate-boost'), 1000);
      }
    } else {
      toast.error(result.error || 'Boost failed');
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

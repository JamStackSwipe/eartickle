// src/components/BoostTickles.js

import { useState } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const BoostTickles = ({ songId, userId }) => {
  const [amount, setAmount] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleBoost = async () => {
    if (!userId || !songId || amount <= 0) {
      toast.error('Invalid boost parameters.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('tickles').insert([
      {
        user_id: userId,
        song_id: songId,
        emoji: 'boost',
        amount,
      },
    ]);

    setLoading(false);

    if (error) {
      toast.error(`❌ ${error.message}`);
    } else {
      toast.success(`🚀 Boosted with ${amount} Tickles!`);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="number"
        min="1"
        step="1"
        value={amount}
        onChange={(e) => setAmount(parseInt(e.target.value))}
        className="w-16 px-2 py-1 rounded text-sm bg-zinc-800 text-white border border-zinc-600"
      />
      <button
        onClick={handleBoost}
        disabled={loading}
        className="px-3 py-1 text-sm rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Boosting...' : 'Boost 🎯'}
      </button>
    </div>
  );
};

export default BoostTickles;

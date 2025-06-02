import { useState } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const spendOptions = [
  { label: 'Promote this track', value: 'promote', cost: 5 },
  { label: 'Feature on Charts', value: 'feature', cost: 10 },
  { label: 'Enter Song Battle', value: 'battle', cost: 3 }
];

const SpendTickles = ({ userId, songId, tickleBalance, onSpent }) => {
  const [spending, setSpending] = useState(null);

  const handleSpend = async (option) => {
    if (tickleBalance < option.cost) {
      toast.error('Not enough Tickles!');
      return;
    }

    const { error } = await supabase.rpc('spend_tickles', {
      user_id: userId,
      song_id: songId,
      reason: option.value,
      cost: option.cost
    });

    if (error) {
      toast.error('Failed to spend Tickles.');
    } else {
      toast.success(`✅ ${option.label} activated!`);
      onSpent?.(); // refresh balance if needed
      setSpending(null);
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-white text-lg font-bold">🎁 Spend Your Tickles</h3>
      {spendOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSpend(option)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm text-left"
        >
          {option.label} — <span className="font-bold">{option.cost}</span> 🎁
        </button>
      ))}
    </div>
  );
};

export default SpendTickles;

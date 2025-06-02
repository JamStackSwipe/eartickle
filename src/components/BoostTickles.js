import React from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const BoostTickles = ({ songId, userId }) => {
  const boost = async (amount) => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      toast.error('Failed to get tickle balance.');
      return;
    }

    if (profile.tickle_balance < amount) {
      toast.error('Not enough Tickles.');
      return;
    }

    const { error } = await supabase.from('tickles').insert([
      {
        user_id: userId,
        song_id: songId,
        amount,
        emoji: '🎯',
      },
    ]);

    if (error) {
      toast.error('Boost failed.');
    } else {
      await supabase
        .from('profiles')
        .update({ tickle_balance: profile.tickle_balance - amount })
        .eq('id', userId);

      toast.success(`🎯 Boosted with ${amount} Tickles!`);
    }
  };

  const buttonStyles = [
    { amount: 5, label: '🎁 Boost', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { amount: 10, label: '🔥 Mega', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { amount: 25, label: '🚀 Super', color: 'bg-rose-100 text-rose-700 hover:bg-rose-200' }, // pink-red
  ];

  return (
    <div className="flex gap-2 justify-end flex-wrap">
      {buttonStyles.map(({ amount, label, color }) => (
        <button
          key={amount}
          onClick={() => boost(amount)}
          className={`px-3 py-1 text-sm rounded-full font-semibold transition ${color}`}
        >
          {label} ({amount})
        </button>
      ))}
    </div>
  );
};

export default BoostTickles;

import React from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const boostSound = new Audio('/sounds/tickle-welcome.mp3');

const BoostTickles = ({ songId, userId, onBoosted }) => {
  const boost = async (amount) => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      toast.error('❌ Failed to get tickle balance.');
      return;
    }

    if (profile.tickle_balance < amount) {
      toast.error('😢 Not enough Tickles.');
      return;
    }

    const { error } = await supabase.rpc('spend_tickles', {
      user_id: userId,
      song_id: songId,
      reason: 'boost',
      cost: amount,
    });

    if (error) {
      toast.error('❌ Boost failed.');
    } else {
      boostSound.play().catch(() => {});
      toast.success(`🎯 Boosted with ${amount} Tickles!`);
      onBoosted?.(); // optional UI refresh
    }
  };

  const buttonStyles = [
    { amount: 5, label: '🎁 Boost', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { amount: 10, label: '🔥 Mega', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { amount: 25, label: '🚀 Super', color: 'bg-rose-100 text-rose-700 hover:bg-rose-200' },
  ];

  return (
    <div className="flex gap-2 justify-end flex-wrap mt-2">
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

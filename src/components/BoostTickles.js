// BoostTickles.js – simplified with 3 fixed buttons

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

    const { error } = await supabase.rpc('boost_song_with_tickles', {
      song_id_input: songId,
      user_id_input: userId,
      tickles_to_spend: amount,
    });

    if (error) {
      toast.error('Boost failed.');
    } else {
      toast.success(`🎯 Boosted with ${amount} Tickles!`);
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      {[5, 10, 25].map((amt) => (
        <button
          key={amt}
          onClick={() => boost(amt)}
          className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
        >
          🎯 Boost {amt}
        </button>
      ))}
    </div>
  );
};

export default BoostTickles;

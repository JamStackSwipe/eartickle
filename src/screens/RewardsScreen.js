import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const RewardsScreen = () => {
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('User not authenticated', userError);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching rewards:', error);
      } else {
        setRewards(data);
      }

      setIsLoading(false);
    };

    fetchRewards();
  }, []);

  if (isLoading) {
    return <div className="p-4 text-center">Loading rewards...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow-md space-y-4">
      <h1 className="text-2xl font-bold">Your Rewards</h1>
      {rewards.length > 0 ? (
        rewards.map((reward, index) => (
          <div key={index} className="border p-4 rounded-md bg-gray-50">
            <p><strong>Reward:</strong> {reward.title}</p>
            <p><strong>Points:</strong> {reward.points}</p>
            <p><strong>Date Earned:</strong> {new Date(reward.created_at).toLocaleDateString()}</p>
          </div>
        ))
      ) : (
        <p>No rewards found.</p>
      )}
    </div>
  );
};

export default RewardsScreen;


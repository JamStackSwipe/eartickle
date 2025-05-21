import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

const RewardsScreen = () => {
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRewards = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('You must be logged in to view rewards.');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to load rewards.');
        console.error(error);
      } else {
        setRewards(data);
      }

      setIsLoading(false);
    };

    fetchRewards();
  }, []);

  const handleRedeem = async (rewardId) => {
    // Placeholder: Implement redemption logic
    alert(`Redeem logic for reward #${rewardId} goes here.`);
  };

  if (isLoading) return <div className="p-4 text-center">Loading your rewards...</div>;
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold">Your Rewards</h1>

      {rewards.length > 0 ? (
        rewards.map((reward) => (
          <div
            key={reward.id}
            className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50"
          >
            <div>
              <p className="text-lg font-semibold">{reward.title}</p>
              <p className="text-sm text-gray-600">
                Earned: {new Date(reward.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm font-bold text-indigo-700">Points: {reward.points}</p>
            </div>
            <button
              onClick={() => handleRedeem(reward.id)}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Redeem
            </button>
          </div>
        ))
      ) : (
        <div className="text-center space-y-2 text-gray-600">
          <p>You don’t have any rewards yet.</p>
          <button
            onClick={() => navigate('/swipe')}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Start Earning
          </button>
        </div>
      )}
    </div>
  );
};

export default RewardsScreen;

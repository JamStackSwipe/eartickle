import React, { useEffect, useState } from 'react';
import { useUser } from '../components/AuthProvider';

const Dashboard = () => {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white px-6 py-10 text-center">
        <p>Please log in to view dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="mb-4">
        <p className="text-lg">Welcome, {user.user_metadata?.name || user.email}</p>
        <p className="text-sm text-gray-400">{user.email}</p>
      </div>

      {loading ? (
        <p>Loading stats...</p>
      ) : stats ? (
        <div className="mt-6">
          <p>Total Songs: {stats.totalSongs}</p>
          <p>Your Tickle Balance: {stats.tickleBalance}</p>
          <p>Songs in JamStack: {stats.jamCount}</p>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;

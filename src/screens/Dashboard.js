import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      setUser(userData);
    };

    const fetchStats = async () => {
      const statsData = { totalUsers: 150, activeSessions: 37 };
      setStats(statsData);
    };

    fetchUser();
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {user && (
        <div className="mb-4">
          <p className="text-lg">Welcome, {user.name}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
      )}
      {stats && (
        <div className="mt-6">
          <p>Total Users: {stats.totalUsers}</p>
          <p>Active Sessions: {stats.activeSessions}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../components/AuthProvider';

const ProfileScreen = () => {
  console.log("✅ ProfileScreen loaded");
  const { user, loading } = useAuth();
  const [jamCount, setJamCount] = useState(0);
  const [uploadCount, setUploadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCounts = async () => {
      if (!user?.id) return;

      const { count: jamTotal } = await supabase
        .from('jamstacksongs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: uploadTotal } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setJamCount(jamTotal || 0);
      setUploadCount(uploadTotal || 0);
      setLoading(false);
    };

    loadCounts();
  }, [user]);

  if (!user) return <p className="text-white p-6">⚠️ You are not logged in.</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">👤 Your Profile</h1>
      <p className="text-teal-300 mb-2">Logged in as: {user.email}</p>
      <p className="text-gray-300 mb-4">User ID: {user.id}</p>

      {loading ? (
        <p className="text-gray-400">Loading your stats...</p>
      ) : (
        <div className="mb-6 space-y-2">
          <p className="text-green-400">🎵 JamStack size: {jamCount}</p>
          <p className="text-yellow-400">🎤 Songs uploaded: {uploadCount}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
        <a href="/swipe" className="bg-teal-400 text-black px-4 py-2 rounded text-center hover:bg-teal-300">
          ➕ Start Swiping
        </a>
        <a href="/jamstack" className="bg-white text-black px-4 py-2 rounded text-center hover:bg-gray-200">
          📚 View JamStack
        </a>
      </div>
    </div>
  );
};

export default ProfileScreen;


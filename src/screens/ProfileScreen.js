import React from 'react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../supabase';

const ProfileScreen = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!user) {
    return <p className="text-center mt-10">You are not logged in.</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">My Profile</h2>

      <div className="space-y-3">
        <div>
          <p className="text-gray-600">Email:</p>
          <p className="font-medium">{user.email}</p>
        </div>

        <div>
          <p className="text-gray-600">User ID:</p>
          <p className="break-all text-sm">{user.id}</p>
        </div>

        <div>
          <p className="text-gray-600">Login Method:</p>
          <p className="capitalize">{user.app_metadata?.provider || 'Unknown'}</p>
        </div>
      </div>

      <button
        onClick={signOut}
        className="mt-6 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
      >
        Log Out
      </button>
    </div>
  );
};

export default ProfileScreen;

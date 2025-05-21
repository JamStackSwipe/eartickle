import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ Rename to avoid redeclaration
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: user, error: userError } = await supabase.auth.getUser();

      if (userError || !user?.user) {
        console.error('No user found or auth error', userError);
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-xl font-bold">Profile</h1>
      {profile ? (
        <>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Joined:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
          <button
            onClick={handleLogout}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Log Out
          </button>
        </>
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
};

export default ProfileScreen;

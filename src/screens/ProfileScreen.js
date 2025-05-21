import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../supabase';

const ProfileScreen = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth'; // ✅ Avoid useNavigate during render
    }
  }, [user, loading]);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (!error) setProfile(data);
    };

    if (user) fetchProfile();
  }, [user]);

  if (loading) return <div className="text-white p-6">Loading profile...</div>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-xl font-bold">Profile</h1>
      {profile ? (
        <>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Joined:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
        </>
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
};

export default ProfileScreen;

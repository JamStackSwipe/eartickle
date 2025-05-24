// 🎤 ProfileScreen.js — Add Booking Email + Social Links

import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const ProfileScreen = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error.message);
      } else {
        setProfile(data || {});
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        bio: profile.bio || '',
        booking_email: profile.booking_email || '',
        website: profile.website || '',
        spotify: profile.spotify || '',
        youtube: profile.youtube || '',
        instagram: profile.instagram || '',
        soundcloud: profile.soundcloud || '',
        tiktok: profile.tiktok || '',
        bandlab: profile.bandlab || ''
      })
      .eq('id', user.id);

    if (error) {
      console.error('❌ Error updating profile:', error.message);
      setMessage('Error saving.');
    } else {
      setMessage('✅ Profile updated!');
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-white text-black p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">👤 My Profile</h1>

      <label className="block text-sm font-semibold">Bio</label>
      <textarea
        value={profile.bio || ''}
        onChange={(e) => handleChange('bio', e.target.value)}
        className="w-full p-2 border rounded"
        rows={3}
      />

      <label className="block text-sm font-semibold">Booking Contact Email</label>
      <input
        type="email"
        value={profile.booking_email || ''}
        onChange={(e) => handleChange('booking_email', e.target.value)}
        className="w-full p-2 border rounded"
      />

      <label className="block text-sm font-semibold">Website</label>
      <input
        type="text"
        value={profile.website || ''}
        onChange={(e) => handleChange('website', e.target.value)}
        className="w-full p-2 border rounded"
      />

      {['spotify', 'youtube', 'instagram', 'soundcloud', 'tiktok', 'bandlab'].map((field) => (
        <div key={field}>
          <label className="block text-sm font-semibold capitalize">{field}</label>
          <input
            type="text"
            value={profile[field] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      ))}

      <button
        onClick={handleSave}
        className="mt-4 bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
      >
        Save Profile
      </button>

      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
};

export default ProfileScreen;

// src/screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const ProfileScreen = () => {
  const [profile, setProfile] = useState({ display_name: '', bio: '', avatar_url: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState('');

  const fetchProfile = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();

    if (data) setProfile(data);
    if (error && error.message !== 'No rows found') console.error(error);
  };

  const handleSave = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) return;

    let avatarUrl = profile.avatar_url;

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.user.id}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) {
        setMessage('Upload failed.');
        return;
      }

      const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(fileName);
      avatarUrl = publicUrl.publicUrl;
    }

    const updates = {
      id: user.user.id,
      display_name: profile.display_name,
      bio: profile.bio,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) {
      setMessage('Error saving profile.');
      console.error(error);
    } else {
      setMessage('Profile updated!');
      setProfile((prev) => ({ ...prev, avatar_url: avatarUrl }));
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '2rem' }}>
      <h2>Profile</h2>
      <label>Display Name</label>
      <input
        type="text"
        value={profile.display_name}
        onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
      />
      <label>Bio</label>
      <textarea
        value={profile.bio}
        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
        style={{ width: '100%', height: '100px', marginBottom: '1rem', padding: '0.5rem' }}
      />
      <label>Avatar Image</label>
      <input
        type="file"
        onChange={(e) => setAvatarFile(e.target.files[0])}
        style={{ marginBottom: '1rem' }}
      />
      <button onClick={handleSave} style={{ padding: '0.5rem 1rem' }}>Save Profile</button>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
      {profile.avatar_url && (
        <img src={profile.avatar_url} alt="Avatar" style={{ width: '100px', marginTop: '1rem' }} />
      )}
    </div>
  );
};

export default ProfileScreen;

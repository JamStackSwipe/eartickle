import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import { genreOptions } from '../utils/genreList';

const ProfileScreen = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState({});
  const [songs, setSongs] = useState([]);
  const [myJams, setMyJams] = useState([]);
  const [tickleStats, setTickleStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showJams, setShowJams] = useState(false);
  const [showUploads, setShowUploads] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUploads();
      fetchMyJams();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (!error && data) setProfile(data);
  };

  const fetchUploads = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) {
      setSongs(data);
      fetchTickleStats(data.map((s) => s.id));
    }
    setLoading(false);
  };

  const fetchMyJams = async () => {
    const { data, error } = await supabase
      .from('jamstacksongs')
      .select('song_id, songs(*)')
      .eq('user_id', user.id);
    if (!error) setMyJams(data.map((item) => item.songs));
  };

  const fetchTickleStats = async (songIds) => {
    const { data, error } = await supabase
      .from('tickles')
      .select('song_id, emoji, count')
      .in('song_id', songIds)
      .group('song_id, emoji');
    if (!error) {
      const grouped = {};
      data.forEach(({ song_id, emoji, count }) => {
        if (!grouped[song_id]) grouped[song_id] = {};
        grouped[song_id][emoji] = count;
      });
      setTickleStats(grouped);
    }
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const updates = {
      id: user.id,
      display_name: profile.display_name || '',
      bio: profile.bio || '',
      avatar_url: profile.avatar_url || '',
      booking_email: profile.booking_email || '',
      website: profile.website || '',
      spotify: profile.spotify || '',
      youtube: profile.youtube || '',
      instagram: profile.instagram || '',
      soundcloud: profile.soundcloud || '',
      tiktok: profile.tiktok || '',
      bandlab: profile.bandlab || '',
      updated_at: new Date(),
    };
    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) {
      console.error('❌ Error saving profile:', error.message);
      setMessage('Error saving.');
    } else {
      setMessage('✅ Profile saved!');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const filePath = `${user.id}/avatar.png`;
    setUploading(true);
    setMessage('');

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: 'public, max-age=3600',
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError.message);
      setMessage('Upload failed.');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Profile update error:', updateError.message);
      setMessage('Avatar saved but profile update failed.');
    } else {
      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      setMessage('✅ Avatar updated!');
    }

    setUploading(false);
  };

  const handleDelete = async (songId) => {
    if (!confirm('Delete this song?')) return;
    await supabase.from('jamstacksongs').delete().eq('song_id', songId).eq('user_id', user.id);
    setMyJams((prev) => prev.filter((s) => s.id !== songId));
  };

  const updateSong = async (id, updates) => {
    if ('stripe_account_id' in updates && updates.stripe_account_id === 'FETCH_FROM_PROFILE') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_account_id')
        .eq('id', user.id)
        .maybeSingle();
      if (!profile?.stripe_account_id) {
        alert('You must connect Stripe in Settings to enable gifting.');
        return;
      }
      updates.stripe_account_id = profile.stripe_account_id;
    }
    await supabase.from('songs').update(updates).eq('id', id);
    fetchUploads();
  };

  const avatarSrc = profile.avatar_url?.trim()
    ? profile.avatar_url
    : user?.user_metadata?.avatar_url || '/default-avatar.png';

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-white text-black p-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-4 mb-6 relative">
        <img
          src={avatarSrc}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover border shadow"
        />
        <label className="absolute top-0 left-0 p-1 cursor-pointer bg-black bg-opacity-60 rounded-full text-white">
          ✏️
          <input type="file" accept="image/*" onChange={handleAvatarChange} hidden disabled={uploading} />
        </label>
        <div className="flex-1">
          <input
            type="text"
            value={profile.display_name || ''}
            onChange={(e) => handleChange('display_name', e.target.value)}
            placeholder="Display Name"
            className="text-xl font-bold w-full border-b p-1"
          />
          <textarea
            value={profile.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell us about you..."
            className="w-full mt-2 p-2 border rounded"
            rows={3}
          />
        </div>
      </div>

      {!profile.stripe_account_id ? (
        <div className="mt-4">
          <button
            onClick={async () => {
              const { data, error } = await supabase.functions.invoke('create-stripe-account');
              if (error) {
                console.error('Stripe connect error:', error);
                alert('Failed

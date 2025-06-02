import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import { genreOptions } from '../utils/genreList';
import MySongCard from '../components/MySongCard';

const ProfileScreen = () => {
  const { user } = useUser();
  const fileInputRef = useRef();

  const [profile, setProfile] = useState({});
  const [songs, setSongs] = useState([]);
  const [jamStackSongs, setJamStackSongs] = useState([]);
  const [tickleStats, setTickleStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [expandedSection, setExpandedSection] = useState('uploads');

  const toggleSection = (section) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUploads();
      fetchJamStack();
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

  const fetchJamStack = async () => {
    const { data, error } = await supabase
      .from('jamstacksongs')
      .select('*, songs(*)')
      .eq('user_id', user.id);

    if (!error && data) {
      const songsOnly = data.map((item) => item.songs);
      setJamStackSongs(songsOnly);
    }
  };

  const fetchTickleStats = async (songIds) => {
    if (!songIds.length) return;
    const { data, error } = await supabase
      .from('tickles')
      .select('song_id, emoji');
    if (error) {
      console.error('❌ Error fetching tickles:', error.message);
      return;
    }
    const stats = {};
    data
      .filter((t) => songIds.includes(t.song_id))
      .forEach(({ song_id, emoji }) => {
        if (!stats[song_id]) stats[song_id] = {};
        stats[song_id][emoji] = (stats[song_id][emoji] || 0) + 1;
      });
    setTickleStats(stats);
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const updates = {
      id: user.id,
      email: user.email || '',
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

    const { error } = await supabase
      .from('profiles')
      .upsert(updates, { onConflict: ['id'] });

    if (error) {
      console.error('❌ Full save error:', error);
      setMessage(`❌ Save failed: ${error.message || 'Unknown error'}`);
    } else {
      setProfile((prev) => ({ ...prev, ...updates }));
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
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError.message);
      setMessage('Upload failed.');
      setUploading(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 300));

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const avatarWithCacheBust = `${publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarWithCacheBust })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Profile update error:', updateError.message);
      setMessage('Avatar saved but profile update failed.');
    } else {
      setProfile((prev) => ({ ...prev, avatar_url: avatarWithCacheBust }));
      setMessage('✅ Avatar updated!');
    }
    setUploading(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = async (songId) => {
    const { error } = await supabase.from('songs').delete().eq('id', songId).eq('user_id', user.id);
    if (!error) setSongs((prev) => prev.filter((s) => s.id !== songId));
  };

  const handlePublish = async (songId) => {
    const { error } = await supabase.from('songs').update({ is_draft: false }).eq('id', songId);
    if (!error) fetchUploads();
  };

  const handleDeleteJam = async (songId) => {
    const { error } = await supabase
      .from('jamstacksongs')
      .delete()
      .eq('song_id', songId)
      .eq('user_id', user.id);
    if (!error) setJamStackSongs((prev) => prev.filter((s) => s.id !== songId));
  };

  const avatarSrc = profile.avatar_url?.trim()
    ? `${profile.avatar_url}`
    : user?.user_metadata?.avatar_url || '/default-avatar.png';

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={avatarSrc}
          alt="avatar"
          onClick={handleAvatarClick}
          className="w-24 h-24 rounded-full object-cover border shadow cursor-pointer hover:opacity-80"
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          style={{ display: 'none' }}
        />
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

      {[ 'booking_email', 'website', 'spotify', 'youtube', 'instagram', 'soundcloud', 'tiktok', 'bandlab' ].map((field) => (
        <div key={field} className="mb-2">
          <label className="block text-sm font-semibold capitalize">
            {field.replace('_', ' ')}
          </label>
          <input
            type="text"
            value={profile[field] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full p-2 border rounded"
            placeholder={`Enter your ${field}`}
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

      {/* Uploaded Songs Section */}
      <div className="mt-10">
        <button
          className="text-lg font-bold underline"
          onClick={() => toggleSection('uploads')}
        >
          {expandedSection === 'uploads' ? '🔽 Hide Uploaded Songs' : '▶️ Show Uploaded Songs'}
        </button>
        {expandedSection === 'uploads' && (
          <div className="space-y-4 mt-4">
            {songs.map((song) => (
              <MySongCard
                key={song.id}
                song={song} variant="jamstack"
                onDelete={handleDelete}
                onPublish={handlePublish}
              />
            ))}
          </div>
        )}
      </div>

      {/* Jam Stack Songs Section */}
      <div className="mt-10">
        <button
          className="text-lg font-bold underline"
          onClick={() => toggleSection('jamstack')}
        >
          {expandedSection === 'jamstack'
            ? '🔽 Hide My Jam Stack'
            : '▶️ Show My Jam Stack'}
        </button>
        {expandedSection === 'jamstack' && (
          <div className="space-y-4 mt-4">
            {jamStackSongs.map((song) => (
              <MySongCard
                key={song.id}
                song={song} variant="jamstack"
                onDelete={handleDeleteJam}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;

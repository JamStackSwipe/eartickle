// Rebuilt ProfileScreen.js - with editable display name and bio
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import MySongCard from '../components/MySongCard';
import Footer from '../components/Footer';

const ProfileScreen = () => {
  const { user } = useUser();
  const fileInputRef = useRef();

  const [profile, setProfile] = useState({});
  const [songs, setSongs] = useState([]);
  const [jamStackSongs, setJamStackSongs] = useState([]);
  const [tickleStats, setTickleStats] = useState({});
  const [showSocial, setShowSocial] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUploads();
      fetchJamStack();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile(data);
  };

  const fetchUploads = async () => {
    const { data } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) {
      setSongs(data);
      fetchTickleStats(data.map((s) => s.id));
    }
  };

  const fetchJamStack = async () => {
    const { data } = await supabase
      .from('jamstacksongs')
      .select(`song_id, songs ( id, title, artist_id, audio, cover, is_draft, created_at )`)
      .eq('user_id', user.id);
    if (data) {
      const songsOnly = data.map((item) => ({
        ...item.songs,
        id: item.song_id || item.songs.id,
      }));
      setJamStackSongs(songsOnly);
    }
  };

  const fetchTickleStats = async (songIds) => {
    if (!songIds.length) return;
    const { data } = await supabase.from('tickles').select('song_id, emoji');
    const stats = {};
    data?.forEach(({ song_id, emoji }) => {
      if (!stats[song_id]) stats[song_id] = {};
      stats[song_id][emoji] = (stats[song_id][emoji] || 0) + 1;
    });
    setTickleStats(stats);
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const updates = { id: user.id, ...profile, updated_at: new Date() };
    const { error } = await supabase.from('profiles').upsert(updates);
    setMessage(error ? `❌ ${error.message}` : '✅ Profile saved!');
    setEditing(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const filePath = `${user.id}/avatar.png`;
    setUploading(true);
    await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    setProfile((prev) => ({ ...prev, avatar_url: url }));
    setUploading(false);
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

  const avatarSrc = profile.avatar_url || user?.user_metadata?.avatar_url || '/default-avatar.png';

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <img
          src={avatarSrc}
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 mx-auto rounded-full border cursor-pointer"
        />
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} hidden />

        {editing ? (
          <input
            value={profile.display_name || ''}
            onChange={(e) => handleChange('display_name', e.target.value)}
            className="mt-4 text-2xl font-bold w-full text-center border-b"
          />
        ) : (
          <h2 className="mt-4 text-2xl font-bold flex justify-center items-center gap-2">
            {profile.display_name || 'Your Name'}
            <button onClick={() => setEditing(true)} className="text-sm text-blue-500">✏️</button>
          </h2>
        )}

        {editing ? (
          <textarea
            value={profile.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            className="w-full mt-2 p-2 border rounded"
            rows={2}
          />
        ) : (
          <p className="text-gray-600 text-sm mt-1">{profile.bio || 'Tell us about yourself'}</p>
        )}

        {editing && (
          <button onClick={handleSave} className="mt-2 bg-blue-600 text-white px-4 py-1 rounded">
            Save
          </button>
        )}
      </div>

      <div className="mb-6">
        <button onClick={() => setShowSocial(!showSocial)} className="text-blue-500 underline font-medium">
          {showSocial ? 'Hide Social Links' : 'Show Social Links'}
        </button>
        {showSocial && (
          <div className="mt-3 space-y-2">
            {[ 'booking_email','website','spotify','youtube','instagram','soundcloud','tiktok','bandlab' ].map((field) => (
              <input
                key={field}
                value={profile[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={`Your ${field.replace('_', ' ')}`}
                className="w-full p-2 border rounded"
              />
            ))}
            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
              Save Profile
            </button>
            {message && <p className="text-sm mt-1 text-green-600">{message}</p>}
          </div>
        )}
      </div>

      {profile.is_artist && songs.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-2">📤 My Uploads</h3>
          <div className="space-y-4">
            {songs.map((song) => (
              <MySongCard
                key={song.id}
                song={song}
                compact
                editable
                stats={tickleStats[song.id] || {}}
                onDelete={(id) => handleDelete(id)}
                onPublish={(id) => handlePublish(id)}
                showStripeButton={!profile.stripe_account_id && !song.is_draft}
              />
            ))}
          </div>
        </div>
      )}

      {jamStackSongs.length > 0 && (
        <div className="mb-10">
          <h3 className="text-2xl font-extrabold text-blue-800 mb-4 tracking-tight uppercase">🎵 My Jam Stack</h3>
          <div className="space-y-4">
            {jamStackSongs.map((song) => (
              <MySongCard
                key={song.id}
                song={song}
                compact
                stats={tickleStats[song.id] || {}}
                onDeleteWithConfirm={() => handleDeleteJam(song.id)}
              />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProfileScreen;

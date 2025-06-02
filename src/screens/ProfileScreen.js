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
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showSocial, setShowSocial] = useState(false);

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

  const fetchReactionStats = async (songIds) => {
    if (!songIds.length) return;

    const [reactionsData, viewsData, jamData] = await Promise.all([
      supabase.from('reactions').select('song_id, emoji'),
      supabase.from('views').select('song_id'),
      supabase.from('jamstacksongs').select('song_id'),
    ]);

    const stats = {};

    reactionsData.data?.forEach(({ song_id, emoji }) => {
      if (songIds.includes(song_id)) {
        stats[song_id] = stats[song_id] || {};
        stats[song_id][emoji] = (stats[song_id][emoji] || 0) + 1;
      }
    });

    viewsData.data?.forEach(({ song_id }) => {
      if (songIds.includes(song_id)) {
        stats[song_id] = stats[song_id] || {};
        stats[song_id].views = (stats[song_id].views || 0) + 1;
      }
    });

    jamData.data?.forEach(({ song_id }) => {
      if (songIds.includes(song_id)) {
        stats[song_id] = stats[song_id] || {};
        stats[song_id].jam_saves = (stats[song_id].jam_saves || 0) + 1;
      }
    });

    setTickleStats(stats);
  };

  const fetchUploads = async () => {
    const { data } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setSongs(data);
      fetchReactionStats(data.map((s) => s.id));
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
      fetchReactionStats(songsOnly.map((s) => s.id));
    }
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
      {/* Avatar + Display Name */}
      <div className="text-center">
        <img
          src={avatarSrc}
          alt="avatar"
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 mx-auto rounded-full object-cover cursor-pointer hover:opacity-80 border shadow"
        />
        <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleAvatarChange} />

        {editing ? (
          <div className="mt-2">
            <input
              value={profile.display_name || ''}
              onChange={(e) => handleChange('display_name', e.target.value)}
              className="text-xl font-bold w-full border-b text-center"
            />
            <textarea
              value={profile.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full mt-2 p-2 border rounded"
              rows={2}
            />
            <button onClick={handleSave} className="mt-2 bg-blue-600 text-white px-4 py-1 rounded">
              Save
            </button>
          </div>
        ) : (
          <div className="mt-2">
            <h2 className="text-xl font-bold">{profile.display_name || 'Unnamed Artist'}</h2>
            <p className="text-sm text-gray-600">{profile.bio || 'No bio yet.'}</p>
            <button onClick={() => setEditing(true)} className="text-blue-500 text-sm mt-1">✏️ Edit</button>
          </div>
        )}
      </div>

      {/* Collapsed Social Links */}
      <div className="mt-4">
        <button
          onClick={() => setShowSocial(!showSocial)}
          className="text-blue-600 underline text-sm"
        >
          {showSocial ? 'Hide Social Links' : 'Show Social Links'}
        </button>
        {showSocial && (
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            {['website', 'spotify', 'youtube', 'instagram', 'soundcloud', 'tiktok', 'bandlab'].map((field) => (
              <input
                key={field}
                value={profile[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={field}
                className="border p-1 rounded"
              />
            ))}
          </div>
        )}
      </div>

      {/* Uploads */}
      {songs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">📤 My Uploads</h3>
          {songs.map((song) => (
            <MySongCard
              key={song.id}
              song={song}
              editable
              stats={tickleStats[song.id] || {}}
              onDelete={() => handleDelete(song.id)}
              onPublish={song.is_draft ? () => handlePublish(song.id) : undefined}
              showStripeButton={!profile.stripe_account_id && !song.is_draft}
            />
          ))}
        </div>
      )}

      {/* Jam Stack */}
      {jamStackSongs.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-extrabold text-blue-800 mb-4 tracking-tight uppercase">🎵 My Jam Stack</h3>
          {jamStackSongs.map((song) => (
            <MySongCard
              key={song.id}
              song={song}
              stats={tickleStats[song.id] || {}}
              onDeleteWithConfirm={() => handleDeleteJam(song.id)}
              compact
            />
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProfileScreen;

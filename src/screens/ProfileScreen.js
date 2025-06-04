// src/screens/ProfileScreen.js

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import MySongCard from '../components/MySongCard';

const socialIcons = {
  website: '🌐',
  spotify: '🎵',
  youtube: '📺',
  instagram: '📸',
  soundcloud: '🔊',
  tiktok: '🎬',
  bandlab: '🎹',
};

const ProfileScreen = () => {
  const { user } = useUser();
  const fileInputRef = useRef();

  const [profile, setProfile] = useState({});
  const [songs, setSongs] = useState([]);
  const [jamStackSongs, setJamStackSongs] = useState([]);
  const [tickleStats, setTickleStats] = useState({});
  const [editing, setEditing] = useState(null);
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

    const [reactions, views, jams] = await Promise.all([
      supabase.from('reactions').select('song_id, emoji'),
      supabase.from('views').select('song_id'),
      supabase.from('jamstacksongs').select('song_id'),
    ]);

    const stats = {};

    reactions.data?.forEach(({ song_id, emoji }) => {
      stats[song_id] = stats[song_id] || {};
      stats[song_id][emoji] = (stats[song_id][emoji] || 0) + 1;
    });

    views.data?.forEach(({ song_id }) => {
      stats[song_id] = stats[song_id] || {};
      stats[song_id].views = (stats[song_id].views || 0) + 1;
    });

    jams.data?.forEach(({ song_id }) => {
      stats[song_id] = stats[song_id] || {};
      stats[song_id].jam_saves = (stats[song_id].jam_saves || 0) + 1;
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
      .select('song_id, songs ( id, title, artist_id, artist, audio, cover, is_draft, created_at )')
      .eq('user_id', user.id);

    if (data) {
      const songsOnly = data.map(({ songs, song_id }) => ({
        ...songs,
        id: song_id || songs.id,
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
    await supabase.from('profiles').upsert(updates);
    setEditing(null);
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
    await supabase.from('songs').delete().eq('id', songId).eq('user_id', user.id);
    setSongs((prev) => prev.filter((s) => s.id !== songId));
  };

  const handlePublish = async (songId) => {
    await supabase.from('songs').update({ is_draft: false }).eq('id', songId);
    fetchUploads();
  };

  const handleDeleteJam = async (songId) => {
    await supabase.from('jamstacksongs').delete().eq('song_id', songId).eq('user_id', user.id);
    setJamStackSongs((prev) => prev.filter((s) => s.id !== songId));
  };

  const avatarSrc = profile.avatar_url || user?.user_metadata?.avatar_url || '/default-avatar.png';

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-8">
      {/* Avatar Section (unchanged) */}
      <div className="text-center">
        <img
          src={avatarSrc}
          alt="avatar"
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 mx-auto rounded-full object-cover cursor-pointer hover:opacity-80 border shadow"
        />
        <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleAvatarChange} />
      </div>

      {/* Display Name, Bio, Social Links (unchanged) */}
      {/* ... (no changes made to any of that logic) ... */}

      {/* My Uploads */}
      {songs.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-blue-500 mb-4">📤 My Uploads</h3>
          {songs.map((song) => (
            <MySongCard
              key={song.id}
              song={{ ...song, artist: profile.display_name }}
              user={user}
              stats={tickleStats[song.id] || {}}
              onDelete={() => handleDelete(song.id)}
              onPublish={song.is_draft ? () => handlePublish(song.id) : undefined}
              showStripeButton={!profile.stripe_account_id && !song.is_draft}
            />
          ))}
        </div>
      )}

      {/* My Jam Stack */}
      {jamStackSongs.length > 0 && (
        <div>
          <hr className="my-6 border-t border-blue-500" />
          <h3 className="text-2xl font-extrabold text-blue-800 mb-4 tracking-tight uppercase text-center">🎵 My Jam Stack</h3>
          <hr className="mb-6 border-t border-blue-500" />
          {jamStackSongs.map((song) => (
            <MySongCard
              key={song.id}
              song={{ ...song, artist: song.artist || profile.display_name }}
              user={user}
              stats={tickleStats[song.id] || {}}
              onDelete={() => handleDeleteJam(song.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;

// Rebuilt ProfileScreen.js - with editable display name and bio and working reaction stats, views, and jam saves
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

  const fetchReactionStats = async (songIds) => {
    if (!songIds.length) return;

    const [reactionsData, viewsData, jamData] = await Promise.all([
      supabase.from('reactions').select('song_id, emoji'),
      supabase.from('views').select('song_id'),
      supabase.from('jamstacksongs').select('song_id')
    ]);

    const stats = {};

    // Emoji stats
    if (reactionsData.data) {
      reactionsData.data
        .filter(({ song_id }) => songIds.includes(song_id))
        .forEach(({ song_id, emoji }) => {
          if (!stats[song_id]) stats[song_id] = {};
          stats[song_id][emoji] = (stats[song_id][emoji] || 0) + 1;
        });
    }

    // View counts
    if (viewsData.data) {
      viewsData.data.forEach(({ song_id }) => {
        if (songIds.includes(song_id)) {
          stats[song_id] = stats[song_id] || {};
          stats[song_id].views = (stats[song_id].views || 0) + 1;
        }
      });
    }

    // Jam stack adds
    if (jamData.data) {
      jamData.data.forEach(({ song_id }) => {
        if (songIds.includes(song_id)) {
          stats[song_id] = stats[song_id] || {};
          stats[song_id].jam_saves = (stats[song_id].jam_saves || 0) + 1;
        }
      });
    }

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
      {/* rest of the JSX unchanged */}
      <Footer />
    </div>
  );
};

export default ProfileScreen;

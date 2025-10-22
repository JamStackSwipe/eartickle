// screens/ProfileScreen.js – Neon migration (NextAuth + fetch API)
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import MySongCard from '../components/MySongCard';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

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
  const { data: session } = useSession();
  const { user, loading: authLoading } = useUser(); // From migrated AuthProvider
  const fileInputRef = useRef();
  const [profile, setProfile] = useState({});
  const [songs, setSongs] = useState([]);
  const [jamStackSongs, setJamStackSongs] = useState([]);
  const [tickleStats, setTickleStats] = useState({});
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showSocial, setShowSocial] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile();
      fetchUploads();
      fetchJamStack();
    } else {
      setProfile({});
      setSongs([]);
      setJamStackSongs([]);
      setTickleStats({});
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profiles/${user.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(data || {});
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const fetchReactionStats = async (songIds) => {
    if (!songIds?.length) return;
    try {
      const res = await fetch(`/api/reaction-stats?ids=${songIds.join(',')}`);
      const stats = await res.json();
      setTickleStats(stats);
    } catch (error) {
      console.error('Reaction Stats Error:', error);
    }
  };

  const fetchUploads = async () => {
    try {
      const res = await fetch(`/api/songs?artist_id=${user.id}&sort=created_at desc`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSongs(data || []);
      if (data.length) fetchReactionStats(data.map((s) => s.id));
    } catch (error) {
      toast.error('Failed to load uploads');
    }
  };

  const fetchJamStack = async () => {
    try {
      const res = await fetch(`/api/jamstack?user_id=${user.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const songsOnly = data.map(({ songs, song_id }) => ({
        ...songs,
        id: song_id || songs.id,
        is_jam: true,
      })) || [];
      setJamStackSongs(songsOnly);
      if (songsOnly.length) fetchReactionStats(songsOnly.map((s) => s.id));
    } catch (error) {
      toast.error('Failed to load Jam Stack');
    }
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/profiles/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, updated_at: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Profile updated!');
      setEditing(null);
    } catch (error) {
      toast.error('Failed to save profile');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);
      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      setProfile((prev) => ({ ...prev, avatar_url: url }));
      toast.success('Avatar updated!');
    } catch (error) {
      toast.error('Failed to update avatar');
    }
    setUploading(false);
  };

  const handleDelete = async (songId) => {
    try {
      const res = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSongs((prev) => prev.filter((s) => s.id !== songId));
      toast.success('Song deleted!');
    } catch (error) {
      toast.error('Failed to delete song');
    }
  };

  const handlePublish = async (songId) => {
    try {
      const res = await fetch(`/api/songs/${songId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_draft: false }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Song published!');
      fetchUploads();
    } catch (error) {
      toast.error('Failed to publish song');
    }
  };

  const handleDeleteJam = async (songId) => {
    try {
      const res = await fetch(`/api/jamstack/${songId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      setJamStackSongs((prev) => prev.filter((s) => s.id !== songId));
      toast.success('Song removed from Jam Stack!');
    } catch (error) {
      toast.error('Failed to remove Jam Stack song');
    }
  };

  const avatarSrc = profile.avatar_url || user?.user_metadata?.avatar_url || '/default-avatar.png';

  if (authLoading) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-8 bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      {/* Profile Header */}
      <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="h-32" style={{ backgroundColor: '#3FD6CD' }}></div>
        <div className="relative flex flex-col items-center -mt-16">
          <div className="relative">
            <img
              src={avatarSrc}
              alt="Profile Avatar"
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl cursor-pointer hover:opacity-90 transition ${
                uploading ? 'opacity-50' : ''
              }`}
            />
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <span className="text-white text-sm">Uploading...</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-center mt-4">
          {editing === 'name' ? (
            <div className="flex flex-col items-center">
              <input
                type="text"
                value={profile.display_name || ''}
                onChange={(e) => handleChange('display_name', e.target.value)}
                placeholder="Your artist name"
                className="text-2xl font-bold text-center border-b-2 border-blue-500 focus:outline-none focus:border-blue-700 bg-transparent w-64 sm:w-80"
                autoFocus
              />
              <div className="flex gap-2 mt-3">
               <button
  onClick={() => {
    setEditingTitle(false);
    setTitle(song.title);
  }}
  className="text-sm text-gray-400 mt-1 ml-2"
  aria-label="Cancel edit"
>
  Cancel
</button>

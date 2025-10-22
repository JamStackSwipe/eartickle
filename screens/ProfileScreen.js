// screens/ProfileScreen.js – Neon migration (NextAuth + fetch API) – Fixed incomplete Cancel button
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
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState({});
  const [songs, setSongs] = useState([]);
  const [jamStackSongs, setJamStackSongs] = useState([]);
  const [tickleStats, setTickleStats] = useState({});
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [originalName, setOriginalName] = useState(''); // For cancel reset
  const [originalBio, setOriginalBio] = useState(''); // For cancel reset
  const fileInputRef = useRef();

  const user = session?.user;
  const authLoading = status === 'loading';

  useEffect(() => {
    if (user && !authLoading) {
      setOriginalName(profile.display_name || '');
      setOriginalBio(profile.bio || '');
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

  const handleCancelEdit = () => {
    if (editing === 'name') {
      setProfile((prev) => ({ ...prev, display_name: originalName }));
    } else if (editing === 'bio') {
      setProfile((prev) => ({ ...prev, bio: originalBio }));
    }
    setEditing(null);
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
                  onClick={handleSave}
                  className="px-4 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold text-gray-800">{profile.display_name || 'Unnamed Artist'}</h1>
              <button
                onClick={() => {
                  setOriginalName(profile.display_name || '');
                  setEditing('name');
                }}
                className="text-gray-500 hover:text-blue-500 transition"
                aria-label="Edit display name"
              >
                ✏️
              </button>
            </div>
          )}
        </div>
        <div className="text-center max-w-md mx-auto mt-4 px-4">
          {editing === 'bio' ? (
            <div className="flex flex-col items-center">
              <textarea
                value={profile.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell your story..."
                rows={4}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 resize-none"
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSave}
                  className="px-4 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <p className="text-sm italic">{profile.bio || 'No bio yet. Click ✏️ to add one.'}</p>
              <button
                onClick={() => {
                  setOriginalBio(profile.bio || '');
                  setEditing('bio');
                }}
                className="text-gray-500 hover:text-blue-500 transition"
                aria-label="Edit bio"
              >
                ✏️
              </button>
            </div>
          )}
        </div>
        <div className="text-center mt-6">
          <button
            onClick={() => setShowSocial(!showSocial)}
            className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold hover:bg-blue-200 transition"
          >
            {showSocial ? 'Hide Social Links' : 'Edit Social Links'}
          </button>
          {showSocial && (
            <div className="mt-4 bg-white rounded-lg shadow p-4 max-w-md mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(socialIcons).map((field) => (
                  <div key={field} className="flex flex-col text-sm">
                    <label htmlFor={field} className="mb-1 text-gray-700 flex items-center gap-1 capitalize">
                      <span>{socialIcons[field]}</span> {field}
                    </label>
                    <input
                      id={field}
                      value={profile[field] || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                      placeholder={`Your ${field} URL`}
                      className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleSave}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition"
              >
                Save Social Links
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Uploads Section */}
      {songs.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold mb-4 text-center" style={{ color: '#3FD6CD' }}>📤 My Uploads</h2>
          {songs.map((song) => (
            <MySongCard
              key={song.id}
              song={{ ...song, artist: profile.display_name }}
              user={user}
              stats={tickleStats[song.id] || {}}
              onDelete={() => handleDelete(song.id)}
              onPublish={song.is_draft ? () => handlePublish(song.id) : undefined}
              editableTitle
              showStripeButton={!profile.stripe_account_id && !song.is_draft}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No uploads yet.</p>
      )}
      {/* Jam Stack Section */}
      {jamStackSongs.length > 0 ? (
        <div>
          <hr className="my-6 border-t border-blue-500" />
          <h2 className="text-xl font-bold mb-4 text-center" style={{ color: '#3FD6CD' }}>🎵 My Jam Stack</h2>
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
      ) : (
        <p className="text-center text-gray-500">No songs in your Jam Stack yet.</p>
      )}
      <Footer />
    </div>
  );
};

export default ProfileScreen;

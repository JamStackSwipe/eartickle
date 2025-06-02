// src/screens/ProfileScreen.js

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import MySongCard from '../components/MySongCard';
import Footer from '../components/Footer';

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
      .select('song_id, songs ( id, title, artist_id, audio, cover, is_draft, created_at )')
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
      {/* Avatar */}
      <div className="text-center">
        <img
          src={avatarSrc}
          alt="avatar"
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 mx-auto rounded-full object-cover cursor-pointer hover:opacity-80 border shadow"
        />
        <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleAvatarChange} />
      </div>

      {/* Display Name */}
      <div className="text-center">
        {editing === 'name' ? (
          <div className="flex flex-col items-center">
            <input
              type="text"
              value={profile.display_name || ''}
              onChange={(e) => handleChange('display_name', e.target.value)}
              placeholder="Your artist name"
              className="text-xl font-bold text-center border-b-2 border-blue-400 focus:outline-none focus:border-blue-600 pb-1 w-64"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button onClick={handleSave} className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600">Save</button>
              <button onClick={() => setEditing(null)} className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-black transition">
            {profile.display_name || 'Unnamed Artist'}
            <button onClick={() => setEditing('name')} className="text-gray-400 hover:text-blue-500">✏️</button>
          </div>
        )}
      </div>

      {/* Bio */}
      <div className="text-center max-w-md mx-auto">
        {editing === 'bio' ? (
          <div className="flex flex-col items-center">
            <textarea
              value={profile.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell your story..."
              rows={3}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button onClick={handleSave} className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600">Save</button>
              <button onClick={() => setEditing(null)} className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition">
            <p>{profile.bio || 'No bio yet. Click ✏️ to add one.'}</p>
            <button onClick={() => setEditing('bio')} className="text-gray-400 hover:text-blue-500">✏️</button>
          </div>
        )}
      </div>

      {/* Social Links */}
      <div className="text-center">
        <button
          onClick={() => setShowSocial(!showSocial)}
          className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm hover:bg-blue-200 transition"
        >
          {showSocial ? 'Hide Social Links' : 'Edit Social Links'}
        </button>
        {showSocial && (
          <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-lg shadow">
            {Object.keys(socialIcons).map((field) => (
              <div key={field} className="flex flex-col text-sm">
                <label htmlFor={field} className="mb-1 text-gray-700 flex items-center gap-1 capitalize">
                  <span>{socialIcons[field]}</span> {field}
                </label>
                <input
                  id={field}
                  value={profile[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={`Enter your ${field}`}
                  className="border border-gray-300 p-2 rounded focus:ring-blue-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Uploads Section */}
      {songs.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-blue-500 mb-4">📤 My Uploads</h3>
          {songs.map((song) => (
            <MySongCard
              key={song.id}
              song={song}
              editableTitle
              stats={tickleStats[song.id] || {}}
              onDelete={() => handleDelete(song.id)}
              onPublish={song.is_draft ? () => handlePublish(song.id) : undefined}
              showStripeButton={!profile.stripe_account_id && !song.is_draft}
            />
          ))}
        </div>
      )}

      {/* Jam Stack Section */}
      {jamStackSongs.length > 0 && (
        <div>
          <hr className="my-6 border-t border-blue-500" />
          <h3 className="text-2xl font-extrabold text-blue-800 mb-4 tracking-tight uppercase text-center">🎵 My Jam Stack</h3>
          <hr className="mb-6 border-t border-blue-500" />
          {jamStackSongs.map((song) => (
            <MySongCard
              key={song.id}
              song={song}
              stats={tickleStats[song.id] || {}}
              onDelete={() => handleDeleteJam(song.id)}
            />
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProfileScreen;

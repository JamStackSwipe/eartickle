import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import AddToJamStackButton from '../components/AddToJamStackButton';
import SendTickleButton from '../components/SendTickleButton';

const ProfileScreen = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState({ display_name: '', bio: '', avatar_url: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [jams, setJams] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [showUploads, setShowUploads] = useState(true);
  const [showJams, setShowJams] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchJams();
      fetchUploads();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile(data);
  };

  const fetchJams = async () => {
    const { data } = await supabase
      .from('jamstacksongs')
      .select('id, songs:song_id(*)')
      .eq('user_id', user.id);
    if (data) setJams(data.map(item => item.songs));
  };

  const fetchUploads = async () => {
    const { data } = await supabase.from('songs').select('*').eq('artist_id', user.id);
    if (data) setUploads(data);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const filePath = `${user.id}/${file.name}`;
    const { error } = await supabase.storage.from('avatars').upload(filePath, file, {
      upsert: true
    });
    if (!error) {
      const { data: publicURLData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const avatarUrl = publicURLData.publicUrl;
      await supabase.from('profiles').update({ avatar_url: filePath }).eq('id', user.id);
      setProfile((prev) => ({ ...prev, avatar_url: filePath }));
    }
  };

  const handleSave = async () => {
    await supabase.from('profiles').update({
      display_name: profile.display_name,
      bio: profile.bio
    }).eq('id', user.id);
    setIsEditing(false);
  };

  return (
    <div className="p-4 text-white">
      <div className="flex items-center space-x-4">
        <label htmlFor="avatar-upload" className="relative cursor-pointer">
          <img
            src={profile.avatar_url ? `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}` : '/default-avatar.png'}
            alt="avatar"
            className="w-20 h-20 rounded-full border border-white"
          />
          <span className="absolute bottom-0 right-0 bg-gray-800 p-1 rounded-full text-xs">✏️</span>
          <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </label>
        <div>
          {isEditing ? (
            <input
              className="text-lg font-bold bg-black border border-white rounded p-1"
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
            />
          ) : (
            <h1 className="text-2xl font-bold">{profile.display_name || 'No Name'}</h1>
          )}
          {isEditing ? (
            <textarea
              className="text-sm bg-black border border-white rounded p-1 mt-1"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          ) : (
            <p className="text-sm text-gray-400">{profile.bio}</p>
          )}
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
          >
            {isEditing ? 'Save' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div
          className="cursor-pointer text-lg font-semibold mb-2"
          onClick={() => setShowUploads(!showUploads)}
        >
          🎤 My Uploads {showUploads ? '▼' : '▶'}
        </div>
        {showUploads && uploads.map((song) => (
          <div key={song.id} className="mb-4 border border-zinc-700 p-2 rounded">
            <a href={`/artist/${song.artist_id}`}>
              <img src={song.cover} alt={song.title} className="w-full rounded mb-2" />
            </a>
            <h2 className="text-xl font-bold">{song.title}</h2>
            <p className="text-sm text-gray-400">by {song.artist}</p>
            <audio src={song.audio} controls className="w-full mt-2" />
            <SendTickleButton songId={song.id} artistId={song.artist_id} />
            <div className="text-xs text-gray-400 mt-2">
              👁️ {song.views || 0} | 🎧 {song.jams || 0} | 🔥 {song.fires || 0} | ❤️ {song.loves || 0} | 😢 {song.sads || 0} | 🎯 {song.bullseyes || 0}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div
          className="cursor-pointer text-lg font-semibold mb-2"
          onClick={() => setShowJams(!showJams)}
        >
          💽 My Jams {showJams ? '▼' : '▶'}
        </div>
        {showJams && jams.map((song) => (
          <div key={song.id} className="mb-4 border border-zinc-700 p-2 rounded">
            <a href={`/artist/${song.artist_id}`}>
              <img src={song.cover} alt={song.title} className="w-full rounded mb-2" />
            </a>
            <h2 className="text-xl font-bold">{song.title}</h2>
            <p className="text-sm text-gray-400">by {song.artist}</p>
            <audio src={song.audio} controls className="w-full mt-2" />
            <AddToJamStackButton songId={song.id} />
            <SendTickleButton songId={song.id} artistId={song.artist_id} />
            <div className="text-xs text-gray-400 mt-2">
              👁️ {song.views || 0} | 🎧 {song.jams || 0} | 🔥 {song.fires || 0} | ❤️ {song.loves || 0} | 😢 {song.sads || 0} | 🎯 {song.bullseyes || 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileScreen;

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import AddToJamStackButton from '../components/AddToJamStackButton';
import SendTickleButton from '../components/SendTickleButton';

const ProfileScreen = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState({});
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [songs, setSongs] = useState([]);
  const [jamSongs, setJamSongs] = useState([]);
  const [showUploads, setShowUploads] = useState(true);
  const [showJams, setShowJams] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);
      setBio(profileData.bio || '');
      setDisplayName(profileData.display_name || '');
      setAvatarUrl(profileData.avatar_url || '');

      const { data: userSongs } = await supabase
        .from('songs')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      setSongs(userSongs || []);

      const { data: jamsData } = await supabase
        .from('jamstacksongs')
        .select('id, song_id, songs:song_id(*)')
        .eq('user_id', user.id);

      setJamSongs(jamsData?.map(j => j.songs) || []);
    };

    fetchData();
  }, [user.id]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
  };

  const handleProfileSave = async () => {
    await supabase
      .from('profiles')
      .update({ bio, display_name: displayName })
      .eq('id', user.id);
    alert('Profile updated!');
  };

  return (
    <div className="p-4 max-w-4xl mx-auto text-white">
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          <img
            src={avatarUrl || '/default-avatar.png'}
            alt="Avatar"
            className="w-20 h-20 rounded-full border border-white object-cover"
          />
          <label className="absolute bottom-0 right-0 bg-blue-600 p-1 rounded-full cursor-pointer text-xs">
            ✏️
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>
        <div className="flex flex-col">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-zinc-800 px-2 py-1 rounded text-white mb-2"
            placeholder="Display Name"
          />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="bg-zinc-800 px-2 py-1 rounded text-white"
            placeholder="Bio"
            rows={2}
          />
          <button
            onClick={handleProfileSave}
            className="mt-2 bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
          >
            Save
          </button>
        </div>
      </div>

      {/* Uploaded Songs */}
      <div className="mb-6">
        <button
          onClick={() => setShowUploads(!showUploads)}
          className="text-lg font-bold mb-2"
        >
          🎵 Uploaded Songs {showUploads ? '▼' : '▶'}
        </button>
        {showUploads && songs.map((song) => (
          <div key={song.id} className="bg-zinc-800 p-4 mb-2 rounded">
            <div className="flex items-center space-x-4">
              <img src={song.cover} alt="" className="w-16 h-16 rounded" />
              <div>
                <div className="text-lg font-semibold">{song.title}</div>
                <div className="text-sm text-gray-400">👁️ {song.views || 0} | 🎧 {song.jams || 0} | 🔥 {song.fires || 0} | ❤️ {song.loves || 0} | 😢 {song.sads || 0} | 🎯 {song.bullseyes || 0}</div>
              </div>
            </div>
            <audio controls src={song.audio} className="mt-2 w-full" />
            <AddToJamStackButton songId={song.id} />
            <SendTickleButton song={song} />
          </div>
        ))}
      </div>

      {/* My Jams */}
      <div>
        <button
          onClick={() => setShowJams(!showJams)}
          className="text-lg font-bold mb-2"
        >
          💾 My JamStack {showJams ? '▼' : '▶'}
        </button>
        {showJams && jamSongs.map((song) => (
          <div key={song.id} className="bg-zinc-800 p-4 mb-2 rounded">
            <div className="flex items-center space-x-4">
              <img src={song.cover} alt="" className="w-16 h-16 rounded" />
              <div>
                <div className="text-lg font-semibold">{song.title}</div>
                <div className="text-sm text-gray-400">👁️ {song.views || 0} | 🎧 {song.jams || 0} | 🔥 {song.fires || 0} | ❤️ {song.loves || 0} | 😢 {song.sads || 0} | 🎯 {song.bullseyes || 0}</div>
              </div>
            </div>
            <audio controls src={song.audio} className="mt-2 w-full" />
            <AddToJamStackButton songId={song.id} />
            <SendTickleButton song={song} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileScreen;

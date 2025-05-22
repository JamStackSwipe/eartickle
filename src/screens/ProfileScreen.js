import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const ProfileScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef();
  const [reactionsMap, setReactionsMap] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, display_name, bio')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setAvatarUrl(data.avatar_url);
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
      }
    };

    const fetchUserSongs = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('songs')
        .select('id, title, artist, cover, views')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSongs(data);
        fetchReactionsForSongs(data.map((s) => s.id));
      }

      setLoading(false);
    };

    fetchProfile();
    fetchUserSongs();
  }, [user]);

  const fetchReactionsForSongs = async (songIds) => {
    if (!songIds.length) return;

    const { data, error } = await supabase
      .from('reactions')
      .select('song_id, emoji')
      .in('song_id', songIds);

    if (error) {
      console.error('❌ Failed to fetch reactions:', error);
      return;
    }

    const map = {};
    data.forEach(({ song_id, emoji }) => {
      if (!map[song_id]) map[song_id] = {};
      if (!map[song_id][emoji]) map[song_id][emoji] = 0;
      map[song_id][emoji]++;
    });

    setReactionsMap(map);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('❌ Failed to upload avatar');
      console.error(uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      alert('❌ Failed to update profile avatar');
      console.error(updateError);
      return;
    }

    setAvatarUrl(publicUrl);
    alert('✅ Avatar updated!');
  };

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, bio })
      .eq('id', user.id);

    if (error) {
      alert('❌ Failed to save profile');
      console.error(error);
      return;
    }

    alert('✅ Profile updated!');
    setEditing(false);
  };

  const handleDelete = async (songId) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId);

    if (error) {
      console.error('❌ Failed to delete song:', error);
      alert('Could not delete song. Please try again.');
      return;
    }

    setSongs((prev) => prev.filter((s) => s.id !== songId));
    alert('🗑️ Song deleted!');
  };

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <h1 className="text-3xl font-bold mb-6">👤 My Profile</h1>

      {/* Avatar */}
      <div className="mb-6">
        <img
          src={avatarUrl || '/default-avatar.png'}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 mb-2"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="text-sm px-3 py-1 bg-indigo-600 rounded text-white hover:bg-indigo-700"
        >
          Upload Avatar
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Display Name + Bio */}
      {!editing ? (
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <h2 className="text-xl font-semibold mr-2">{displayName || 'Unnamed Artist'}</h2>
            <button onClick={() => setEditing(true)} title="Edit">
              ✏️
            </button>
          </div>
          <p className="text-gray-600">{bio || 'No bio yet.'}</p>
        </div>
      ) : (
        <div className="mb-8 space-y-3">
          <div>
            <label className="block text-sm mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-100 text-black border border-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded bg-gray-100 text-black border border-gray-400"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            className="px-4 py-2 bg-green-600 rounded text-white hover:bg-green-700"
          >
            Save
          </button>
        </div>
      )}

      {/* Uploaded Songs */}
      <p className="mb-2 text-sm text-gray-500">Email: {user?.email}</p>
      <p className="mb-6 text-sm text-gray-400">User ID: {user?.id}</p>

      {loading ? (
        <p>Loading your uploads...</p>
      ) : songs.length === 0 ? (
        <p className="text-gray-500">You haven’t uploaded any songs yet.</p>
      ) : (
        <ul className="space-y-4">
          {songs.map((song) => (
            <li
              key={song.id}
              className="bg-gray-100 p-4 rounded-lg shadow flex items-start space-x-4"
            >
              {song.cover ? (
                <img
                  src={song.cover}
                  alt="cover"
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-300 flex items-center justify-center rounded">
                  🎵
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{song.title || 'Untitled'}</h2>
                <p className="text-sm text-gray-600 mb-1">{song.artist || 'Unknown Artist'}</p>
                <p className="text-sm text-gray-500 mb-1">👁️ {song.views || 0} views</p>
                <div className="flex gap-3 text-lg">
                  {['🔥', '❤️', '😢', '🎯'].map((emoji) => (
                    <span key={emoji}>
                      {emoji} {reactionsMap[song.id]?.[emoji] || 0}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleDelete(song.id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfileScreen;

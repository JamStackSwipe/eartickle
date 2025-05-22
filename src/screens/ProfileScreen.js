import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const ProfileScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef();

  // Fetch uploaded songs
  useEffect(() => {
    const fetchUserSongs = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('songs')
        .select('id, title, artist, cover')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user songs:', error);
      } else {
        setSongs(data);
      }

      setLoading(false);
    };

    fetchUserSongs();
  }, [user]);

  // Fetch avatar from `profiles` table
  useEffect(() => {
    const fetchAvatar = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (!error && data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    };

    if (user) fetchAvatar();
  }, [user]);

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
      alert('❌ Failed to update profile');
      console.error(updateError);
      return;
    }

    setAvatarUrl(publicUrl);
    alert('✅ Avatar updated!');
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
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">👤 My Profile</h1>

      {/* Avatar section */}
      <div className="mb-6">
        <img
          src={avatarUrl || '/default-avatar.png'}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-white mb-2"
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

      {/* User info */}
      <p className="mb-4">Email: {user?.email}</p>
      <p className="mb-8 text-sm text-gray-400">User ID: {user?.id}</p>

      {/* Song list */}
      {loading ? (
        <p>Loading your uploads...</p>
      ) : songs.length === 0 ? (
        <p className="text-gray-400">You haven’t uploaded any songs yet.</p>
      ) : (
        <ul className="space-y-4">
          {songs.map((song) => (
            <li
              key={song.id}
              className="bg-gray-900 p-4 rounded-lg shadow flex items-center space-x-4"
            >
              {song.cover ? (
                <img
                  src={song.cover}
                  alt="cover"
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-700 flex items-center justify-center rounded">
                  🎵
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{song.title || 'Untitled'}</h2>
                <p className="text-sm text-gray-400">{song.artist || 'Unknown Artist'}</p>
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

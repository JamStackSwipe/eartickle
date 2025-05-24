import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const ProfileScreen = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bioInput, setBioInput] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        setBioInput(data.bio || '');
      }
    };

    const fetchSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSongs(data);
      }

      setLoading(false);
    };

    fetchProfile();
    fetchSongs();
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error.message);
      return;
    }

    const { publicUrl } = supabase.storage.from('avatars').getPublicUrl(filePath).data;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (!updateError) {
      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
    }
  };

  const handleBioSave = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ bio: bioInput })
      .eq('id', user.id);

    if (!error) {
      setProfile((prev) => ({ ...prev, bio: bioInput }));
      setEditing(false);
    }
  };

  const handleDeleteSong = async (songId) => {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId);

    if (!error) {
      setSongs((prev) => prev.filter((song) => song.id !== songId));
    }
  };

  if (loading || !profile) {
    return <div className="p-6 text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black p-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-4 mb-6">
        <label htmlFor="avatar-upload" className="cursor-pointer">
          <img
            src={
              profile.avatar_url ||
              user?.user_metadata?.avatar_url ||
              '/default-avatar.png'
            }
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover border"
          />
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <div>
          <h1 className="text-2xl font-bold">{profile.display_name || 'Unnamed User'}</h1>
          {editing ? (
            <>
              <textarea
                className="w-full p-2 border rounded"
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
              />
              <button
                className="mt-2 text-sm text-blue-500"
                onClick={handleBioSave}
              >
                💾 Save Bio
              </button>
            </>
          ) : (
            <p className="text-gray-600">
              {profile.bio || 'No bio yet.'}{' '}
              <button
                className="text-blue-500 text-sm"
                onClick={() => setEditing(true)}
              >
                ✏️ Edit
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Uploaded Songs */}
      <h2 className="text-xl font-semibold mb-3">🎵 Your Uploaded Songs</h2>
      {songs.length === 0 ? (
        <p className="text-gray-500">You haven’t uploaded any songs yet.</p>
      ) : (
        <ul className="space-y-4">
          {songs.map((song) => (
            <li
              key={song.id}
              className="bg-gray-100 p-4 rounded shadow flex items-center space-x-4"
            >
              <img
                src={song.cover || '/default-cover.png'}
                alt="cover"
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{song.title}</h3>
                <p className="text-sm text-gray-500">{song.artist}</p>
              </div>
              <button
                onClick={() => handleDeleteSong(song.id)}
                className="text-red-500 text-sm hover:underline"
              >
                🗑️ Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfileScreen;

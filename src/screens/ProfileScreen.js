import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [songs, setSongs] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      setUser(userData.user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setAvatarUrl(profileData.avatar_url || userData.user.user_metadata.avatar_url || '');
        setBio(profileData.bio || '');
        setDisplayName(profileData.display_name || '');
      }

      const { data: uploadedSongs } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (uploadedSongs) setSongs(uploadedSongs);
      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    const filePath = `avatars/${user.id}/avatar.png`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message);
      return;
    }

    const publicUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/${filePath}`;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: filePath })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Failed to update profile avatar URL:', updateError.message);
    } else {
      setAvatarUrl(publicUrl);
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, bio })
      .eq('id', user.id);

    if (error) {
      console.error('❌ Error saving profile:', error.message);
    } else {
      alert('✅ Profile updated!');
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="flex items-center space-x-6 mb-6">
        <label htmlFor="avatar-upload" className="cursor-pointer">
          <img
            src={
              avatarUrl?.startsWith('http')
                ? avatarUrl
                : `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/${avatarUrl}`
            }
            alt="avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow hover:opacity-80 transition"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-avatar.png';
            }}
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
          <input
            className="text-2xl font-bold border-b border-gray-300 focus:outline-none"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display Name"
          />
          <textarea
            className="mt-2 w-full text-gray-700 border border-gray-300 rounded p-2"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
          />
          <button
            onClick={handleSave}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Profile
          </button>
        </div>
      </div>

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
                src={song.cover}
                alt="cover"
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-grow">
                <h3 className="text-lg font-semibold">{song.title}</h3>
                <p className="text-sm text-gray-500">{song.artist}</p>
                <div className="text-sm text-gray-600 mt-1">
                  👁️ {song.views || 0} | 📥 {song.jams || 0} | 🔥 {song.fires || 0} | ❤️ {song.loves || 0} | 😢 {song.sads || 0} | 🎯 {song.bullseyes || 0}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfileScreen;

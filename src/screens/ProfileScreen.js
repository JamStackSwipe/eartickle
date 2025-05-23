import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const ProfileScreen = () => {
  const { user } = useUser();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, display_name, bio')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error("❌ Error fetching profile:", error.message);
      } else if (data) {
        console.log("✅ Profile loaded:", data);
        if (data.avatar_url) {
          console.log("🖼 Avatar from DB:", data.avatar_url);
          setAvatarUrl(data.avatar_url);
        }
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
      }
    };

    fetchProfile();
  }, [user]);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    const ext = file.name.split('.').pop();
    const filePath = `${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('❌ Failed to upload avatar');
      console.error("Upload error:", uploadError.message);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = data?.publicUrl;

    console.log("🖼 New avatar public URL:", publicUrl);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      alert('❌ Failed to update avatar');
      console.error("Update error:", updateError.message);
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
      console.error("Save profile error:", error.message);
      return;
    }

    setEditing(false);
    alert('✅ Profile updated!');
  };

  return (
    <div className="min-h-screen p-6 bg-white text-black">
      <h1 className="text-2xl font-bold mb-6">👤 My Profile</h1>

      {/* Avatar Upload */}
      <div className="mb-6">
        <img
          src={avatarUrl || '/default-avatar.png'}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover border mb-2"
          onError={(e) => {
            console.warn("⚠️ Avatar failed to load, reverting to default.");
            e.target.src = '/default-avatar.png';
          }}
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

      {/* Display Name / Bio */}
      {!editing ? (
        <div className="mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold mr-2">{displayName || 'No name yet'}</h2>
            <button onClick={() => setEditing(true)} title="Edit">✏️</button>
          </div>
          <p className="text-gray-600">{bio || 'No bio yet.'}</p>
        </div>
      ) : (
        <div className="mb-6 space-y-3">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-2 rounded border"
            placeholder="Display Name"
          />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full p-2 rounded border"
            placeholder="Bio"
          />
          <button
            onClick={handleSaveProfile}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      )}

      {/* Debug Info */}
      <p className="text-sm text-gray-500 mb-1">Email: {user?.email}</p>
      <p className="text-sm text-gray-400 mb-6">User ID: {user?.id}</p>

      {/* Placeholder Stats */}
      <div className="bg-gray-100 p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">📊 Your Listening Stats (coming soon)</h3>
        <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
          <li>Swipes this week: —</li>
          <li>JamStack adds: —</li>
          <li>Reactions sent: —</li>
          <li>Views generated: —</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileScreen;

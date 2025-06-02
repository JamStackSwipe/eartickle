//rebuilt from the ground up
// Rebuilt ProfileScreen.js
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import MySongCard from '../components/MySongCard';
import Footer from '../components/Footer';

const ProfileScreen = () => {
  const { user } = useUser();
  const fileInputRef = useRef();

  const [profile, setProfile] = useState({});
  const [songs, setSongs] = useState([]);
  const [jamStackSongs, setJamStackSongs] = useState([]);
  const [tickleStats, setTickleStats] = useState({});
  const [showSocial, setShowSocial] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUploads();
      fetchJamStack();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) setProfile(data);
  };

  const fetchUploads = async () => {
    const { data } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) {
      setSongs(data);
      fetchTickleStats(data.map((s) => s.id));
    }
  };

  const fetchJamStack = async () => {
    const { data } = await supabase
      .from('jamstacksongs')
      .select(`song_id, songs ( id, title, artist_id, audio, cover, is_draft, created_at )`)
      .eq('user_id', user.id);

    if (data) {
      const songsOnly = data.map((item) => ({
        ...item.songs,
        id: item.song_id || item.songs.id,
      }));
      setJamStackSongs(songsOnly);
    }
  };

  const fetchTickleStats = async (songIds) => {
    if (!songIds.length) return;
    const { data } = await supabase.from('tickles').select('song_id, emoji');
    const stats = {};
    data?.forEach(({ song_id, emoji }) => {
      if (!stats[song_id]) stats[song_id] = {};
      stats[song_id][emoji] = (stats[song_id][emoji] || 0) + 1;
    });
    setTickleStats(stats);
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const updates = { id: user.id, ...profile, updated_at: new Date() };
    const { error } = await supabase.from('profiles').upsert(updates);
    setMessage(error ? `❌ ${error.message}` : '✅ Profile saved!');
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

  const avatarSrc = profile.avatar_url || user?.user_metadata?.avatar_url || '/default-avatar.png';

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Avatar & Display Name */}
      <div className="text-center mb-6">
        <img
          src={avatarSrc}
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 mx-auto rounded-full border cursor-pointer"
        />
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} hidden />
        <h2 className="mt-4 text-2xl font-bold">{profile.display_name || 'Your Name'}</h2>
        <p className="text-gray-600 text-sm mt-1">{profile.bio || 'Tell us about yourself'}</p>
      </div>

      {/* Social Links */}
      <div className="mb-6">
        <button onClick={() => setShowSocial(!showSocial)} className="text-blue-500 underline font-medium">
          {showSocial ? 'Hide Social Links' : 'Show Social Links'}
        </button>
        {showSocial && (
          <div className="mt-3 space-y-2">
            {[ 'booking_email','website','spotify','youtube','instagram','soundcloud','tiktok','bandlab' ].map((field) => (
              <input
                key={field}
                value={profile[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={`Your ${field.replace('_', ' ')}`}
                className="w-full p-2 border rounded"
              />
            ))}
            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
              Save Profile
            </button>
            {message && <p className="text-sm mt-1 text-green-600">{message}</p>}
          </div>
        )}
      </div>

      {/* My Uploads */}
      {profile.is_artist && songs.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-extrabold text-blue-800 mb-4 tracking-tight uppercase">📤 My Uploads</h2>
          <div className="space-y-4">
            {songs.map((song) => (
              <MySongCard
                key={song.id}
                song={song}
                compact
                editable
                stats={tickleStats[song.id] || {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* My Jam Stack */}
      {jamStackSongs.length > 0 && (
        <div className="mb-10">
         <h2 className="text-2xl font-extrabold text-blue-800 mb-4 tracking-tight uppercase">🎵 My Jam Stack</h2>
          <div className="space-y-4">
            {jamStackSongs.map((song) => (
              <MySongCard
                key={song.id}
                song={song}
                compact
                onDeleteWithConfirm
                stats={tickleStats[song.id] || {}}
              />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProfileScreen;

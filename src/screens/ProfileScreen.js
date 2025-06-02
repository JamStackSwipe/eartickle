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
  const [editing, setEditing] = useState(null); // 'name' or 'bio'
  const [message, setMessage] = useState('');
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

    const [reactionsData, viewsData, jamData] = await Promise.all([
      supabase.from('reactions').select('song_id, emoji'),
      supabase.from('views').select('song_id'),
      supabase.from('jamstacksongs').select('song_id'),
    ]);

    const stats = {};

    reactionsData.data?.forEach(({ song_id, emoji }) => {
      if (songIds.includes(song_id)) {
        stats[song_id] = stats[song_id] || {};
        stats[song_id][emoji] = (stats[song_id][emoji] || 0) + 1;
      }
    });

    viewsData.data?.forEach(({ song_id }) => {
      if (songIds.includes(song_id)) {
        stats[song_id] = stats[song_id] || {};
        stats[song_id].views = (stats[song_id].views || 0) + 1;
      }
    });

    jamData.data?.forEach(({ song_id }) => {
      if (songIds.includes(song_id)) {
        stats[song_id] = stats[song_id] || {};
        stats[song_id].jam_saves = (stats[song_id].jam_saves || 0) + 1;
      }
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
      .select(`song_id, songs ( id, title, artist_id, audio, cover, is_draft, created_at )`)
      .eq('user_id', user.id);

    if (data) {
      const songsOnly = data.map((item) => ({
        ...item.songs,
        id: item.song_id || item.songs.id,
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
    const { error } = await supabase.from('profiles').upsert(updates);
    setMessage(error ? `❌ ${error.message}` : '✅ Profile saved!');
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
    const { error } = await supabase.from('songs').delete().eq('id', songId).eq('user_id', user.id);
    if (!error) setSongs((prev) => prev.filter((s) => s.id !== songId));
  };

  const handlePublish = async (songId) => {
    const { error } = await supabase.from('songs').update({ is_draft: false }).eq('id', songId);
    if (!error) fetchUploads();
  };

  const handleDeleteJam = async (songId) => {
    const { error } = await supabase
      .from('jamstacksongs')
      .delete()
      .eq('song_id', songId)
      .eq('user_id', user.id);
    if (!error) setJamStackSongs((prev) => prev.filter((s) => s.id !== songId));
  };

  const avatarSrc = profile.avatar_url || user?.user_metadata?.avatar_url || '/default-avatar.png';

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Avatar (locked) */}
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
<div className="mt-6 text-center relative group">
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
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(null)}
          className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <div className="inline-block relative">
      <h2 className="text-xl font-bold text-gray-800 hover:text-black transition">
        {profile.display_name || 'Unnamed Artist'}
      </h2>
      <button 
        onClick={() => setEditing('name')} 
        className="absolute -right-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
  )}
</div>

{/* Bio */}
<div className="mt-4 text-center relative group max-w-md mx-auto">
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
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(null)}
          className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <div className="inline-block relative px-6">
      <p className="text-gray-600 hover:text-gray-800 transition">
        {profile.bio || 'No bio yet. Click to add one...'}
      </p>
      <button 
        onClick={() => setEditing('bio')} 
        className="absolute -right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
  )}
</div>

    

      {/* Collapsible Social Links */}
      <div className="mt-4">
        <button
          onClick={() => setShowSocial(!showSocial)}
          className="text-blue-600 underline text-sm"
        >
          {showSocial ? 'Hide Social Links' : 'Show Social Links'}
        </button>
        {showSocial && (
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            {['website', 'spotify', 'youtube', 'instagram', 'soundcloud', 'tiktok', 'bandlab'].map((field) => (
              <input
                key={field}
                value={profile[field] || ''}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={field}
                className="border p-1 rounded"
              />
            ))}
          </div>
        )}
      </div>

      {/* Uploads */}
      {songs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">📤 My Uploads</h3>
          {songs.map((song) => (
            <MySongCard
              key={song.id}
              song={song}
              editable
              stats={tickleStats[song.id] || {}}
              onDelete={() => handleDelete(song.id)}
              onPublish={song.is_draft ? () => handlePublish(song.id) : undefined}
              showStripeButton={!profile.stripe_account_id && !song.is_draft}
            />
          ))}
        </div>
      )}

      {/* Jam Stack */}
      {jamStackSongs.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-extrabold text-blue-800 mb-4 tracking-tight uppercase">🎵 My Jam Stack</h3>
          {jamStackSongs.map((song) => (
            <MySongCard
              key={song.id}
              song={song}
              stats={tickleStats[song.id] || {}}
              onDeleteWithConfirm={() => handleDeleteJam(song.id)}
              compact
            />
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProfileScreen;

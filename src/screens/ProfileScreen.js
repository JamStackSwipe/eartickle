import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import MySongCard from '../components/MySongCard';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

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
    } else {
      setProfile({});
      setSongs([]);
      setJamStackSongs([]);
      setTickleStats({});
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setProfile(data || {});
      console.log('Profile Fetched:', data);
    } catch (error) {
      toast.error('Failed to load profile');
      console.error('Profile Fetch Error:', error);
    }
  };

  const fetchReactionStats = async (songIds) => {
    if (!songIds?.length) {
      console.log('No song IDs for reaction stats');
      return;
    }

    try {
      const [reactions, views, jams] = await Promise.all([
        supabase.from('reactions').select('song_id, emoji').in('song_id', songIds),
        supabase.from('views').select('song_id').in('song_id', songIds),
        supabase.from('jamstacksongs').select('song_id').in('song_id', songIds),
      ]);

      const stats = {};
      songIds.forEach((id) => {
        stats[id] = { fires: 0, loves: 0, sads: 0, bullseyes: 0, views: 0, jam_saves: 0 };
      });

      reactions.data?.forEach(({ song_id, emoji }) => {
        const key = emoji === 'fire' ? 'fires' : emoji === 'heart' ? 'loves' : emoji === 'cry' ? 'sads' : 'bullseyes';
        stats[song_id][key] = (stats[song_id][key] || 0) + 1;
      });

      views.data?.forEach(({ song_id }) => {
        stats[song_id].views = (stats[song_id].views || 0) + 1;
      });

      jams.data?.forEach(({ song_id }) => {
        stats[song_id].jam_saves = (stats[song_id].jam_saves || 0) + 1;
      });

      setTickleStats(stats);
      console.log('Reaction Stats Fetched:', stats);
    } catch (error) {
      console.error('Reaction Stats Error:', error);
    }
  };

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('id, title, artist, cover, audio, genre_flavor, is_draft, user_id, artist_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSongs(data || []);
      console.log('Uploads Fetched:', data);
      if (data?.length) fetchReactionStats(data.map((s) => s.id));
    } catch (error) {
      toast.error('Failed to load uploads');
      console.error('Uploads Fetch Error:', error);
    }
  };

  const fetchJamStack = async () => {
    try {
      const { data, error } = await supabase
        .from('jamstacksongs')
        .select('song_id, songs ( id, title, artist, cover, audio, genre_flavor, is_draft, user_id, artist_id, created_at )')
        .eq('user_id', user.id);
      if (error) throw error;
      const songsOnly = data?.map(({ songs, song_id }) => ({
        ...songs,
        id: song_id || songs.id,
        is_jam: true,
      })) || [];
      setJamStackSongs(songsOnly);
      console.log('Jam Stack Fetched:', songsOnly);
      if (songsOnly.length) fetchReactionStats(songsOnly.map((s) => s.id));
    } catch (error) {
      toast.error('Failed to load Jam Stack');
      console.error('Jam Stack Fetch Error:', error);
    }
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const updates = { id: user.id, ...profile, updated_at: new Date().toISOString() };
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      toast.success('Profile updated!');
      setEditing(null);
    } catch (error) {
      toast.error('Failed to save profile');
      console.error('Profile Save Error:', error);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const filePath = `${user.id}/avatar.png`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id);
      if (updateError) throw updateError;
      setProfile((prev) => ({ ...prev, avatar_url: url }));
      toast.success('Avatar updated!');
    } catch (error) {
      toast.error('Failed to update avatar');
      console.error('Avatar Upload Error:', error);
    }
    setUploading(false);
  };

  const handleDelete = async (songId) => {
    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId)
        .eq('user_id', user.id);
      if (error) throw error;
      setSongs((prev) => prev.filter((s) => s.id !== songId));
      toast.success('Song deleted!');
    } catch (error) {
      toast.error('Failed to delete song');
      console.error('Delete Song Error:', error);
    }
  };

  const handlePublish = async (songId) => {
    try {
      const { error } = await supabase
        .from('songs')
        .update({ is_draft: false })
        .eq('id', songId)
        .eq('user_id', user.id);
      if (error) throw error;
      toast.success('Song published!');
      fetchUploads();
    } catch (error) {
      toast.error('Failed to publish song');
      console.error('Publish Song Error:', error);
    }
  };

  const handleDeleteJam = async (songId) => {
    try {
      const { error } = await supabase
        .from('jamstacksongs')
        .delete()
        .eq('song_id', songId)
        .eq('user_id', user.id);
      if (error) throw error;
      setJamStackSongs((prev) => prev.filter((s) => s.id !== songId));
      toast.success('Song removed from Jam Stack!');
    } catch (error) {
      toast.error('Failed to remove Jam Stack song');
      console.error('Delete Jam Error:', error);
    }
  };

  const avatarSrc = profile.avatar_url || user?.user_metadata?.avatar_url || '/default-avatar.png';

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-8 bg-gray-100 min-h-screen">
      {/* Avatar */}
      <div className="text-center">
        <img
          src={avatarSrc}
          alt="Profile Avatar"
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`w-24 h-24 mx-auto rounded-full object-cover cursor-pointer hover:opacity-80 border-2 border-blue-500 shadow-lg ${uploading ? 'opacity-50' : ''}`}
        />
        <input
          type="file"
          hidden
          ref={fileInputRef}
          accept="image/*"
          onChange={handleAvatarChange}
          disabled={uploading}
        />
        {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
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
              className="text-xl font-bold text-center border-b-2 border-blue-400 focus:outline-none focus:border-blue-600 pb-1 w-64 bg-transparent"
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
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-black transition">
            {profile.display_name || 'Unnamed Artist'}
            <button
              onClick={() => setEditing('name')}
              className="text-gray-400 hover:text-blue-500 transition"
              aria-label="Edit display name"
            >
              ✏️
            </button>
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
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition">
            <p>{profile.bio || 'No bio yet. Click ✏️ to add one.'}</p>
            <button
              onClick={() => setEditing('bio')}
              className="text-gray-400 hover:text-blue-500 transition"
              aria-label="Edit bio"
            >
              ✏️
            </button>
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
          <div className="grid grid-cols-2 gap-4 mt-4 bg-white p-4 rounded-lg shadow">
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
                  className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            ))}
            <button
              onClick={handleSave}
              className="col-span-2 mt-2 px-4 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition"
            >
              Save Social Links
            </button>
          </div>
        )}
      </div>

      {/* Uploads Section */}
      {songs.length > 0 ? (
        <div>
          <h3 className="text-xl font-bold text-blue-500 mb-4 text-center">📤 My Uploads</h3>
          {songs.map((song) => {
            console.log('My Uploads Song:', {
              id: song.id,
              title: song.title,
              artist: profile.display_name,
              user_id: user?.id,
              stats: tickleStats[song.id] || {},
              editableTitle: true,
              showStripeButton: !profile.stripe_account_id && !song.is_draft,
              is_draft: song.is_draft,
            });
            return (
              <MySongCard
                key={song.id}
                song={{ ...song, artist: profile.display_name }}
                user={user}
                stats={tickleStats[song.id] || {}}
                onDelete={() => handleDelete(song.id)}
                onPublish={song.is_draft ? () => handlePublish(song.id) : undefined}
                editableTitle
                showStripeButton={!profile.stripe_account_id && !song.is_draft}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No uploads yet.</p>
      )}

      {/* Jam Stack Section */}
      {jamStackSongs.length > 0 ? (
        <div>
          <hr className="my-6 border-t border-blue-500" />
          <h3 className="text-2xl font-extrabold text-blue-800 mb-4 tracking-tight uppercase text-center">🎵 My Jam Stack</h3>
          <hr className="mb-6 border-t border-blue-500" />
          {jamStackSongs.map((song) => {
            console.log('My Jams Song:', {
              id: song.id,
              title: song.title,
              artist: song.artist || profile.display_name,
              user_id: user?.id,
              stats: tickleStats[song.id] || {},
            });
            return (
              <MySongCard
                key={song.id}
                song={{ ...song, artist: song.artist || profile.display_name }}
                user={user}
                stats={tickleStats[song.id] || {}}
                onDelete={() => handleDeleteJam(song.id)}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No songs in your Jam Stack yet.</p>
      )}

      <Footer />
    </div>
  );
};

export default ProfileScreen;

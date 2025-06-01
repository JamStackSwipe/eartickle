// Full ProfileScreen.js with all features preserved and collapsible sections

import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import { genreOptions } from '../utils/genreList';

const ProfileScreen = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState({});
  const [songs, setSongs] = useState([]);
  const [jamStackSongs, setJamStackSongs] = useState([]);
  const [tickleStats, setTickleStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUploads, setShowUploads] = useState(true);
  const [showJamStack, setShowJamStack] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUploads();
      fetchJamStack();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (!error && data) setProfile(data);
  };

  const fetchUploads = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) {
      setSongs(data);
      fetchTickleStats(data.map((s) => s.id));
    }
    setLoading(false);
  };

  const fetchJamStack = async () => {
    const { data, error } = await supabase
      .from('jamstacksongs')
      .select('id, song_id, songs:song_id(id, title, artist, artist_id, user_id, cover, audio, views, jams, fires, loves, sads, bullseyes)')
      .eq('user_id', user.id);
    if (!error) {
      const filtered = data.map((item) => item.songs).filter((s) => s.user_id !== user.id);
      setJamStackSongs(filtered);
    }
  };

  const fetchTickleStats = async (songIds) => {
    const { data, error } = await supabase
      .from('tickles')
      .select('song_id, emoji, count')
      .in('song_id', songIds)
      .group('song_id, emoji');
    if (!error) {
      const grouped = {};
      data.forEach(({ song_id, emoji, count }) => {
        if (!grouped[song_id]) grouped[song_id] = {};
        grouped[song_id][emoji] = count;
      });
      setTickleStats(grouped);
    }
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const updates = {
      id: user.id,
      display_name: profile.display_name || '',
      bio: profile.bio || '',
      avatar_url: profile.avatar_url || '',
      booking_email: profile.booking_email || '',
      website: profile.website || '',
      spotify: profile.spotify || '',
      youtube: profile.youtube || '',
      instagram: profile.instagram || '',
      soundcloud: profile.soundcloud || '',
      tiktok: profile.tiktok || '',
      bandlab: profile.bandlab || '',
      updated_at: new Date(),
    };
    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) {
      console.error('❌ Error saving profile:', error.message);
      setMessage('Error saving.');
    } else {
      setMessage('✅ Profile saved!');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const filePath = `${user.id}/avatar.png`;
    setUploading(true);
    setMessage('');
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: 'public, max-age=3600'
      });
    if (uploadError) {
      console.error('❌ Upload error:', uploadError.message);
      setMessage('Upload failed.');
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);
    if (updateError) {
      console.error('❌ Profile update error:', updateError.message);
      setMessage('Avatar saved but profile update failed.');
    } else {
      setMessage('✅ Avatar updated!');
      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
    }
    setUploading(false);
  };

  const handleDelete = async (songId) => {
    if (!confirm('Delete this song?')) return;
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId)
      .eq('user_id', user.id);
    if (!error) setSongs((prev) => prev.filter((s) => s.id !== songId));
  };

  const handleDeleteJam = async (songId) => {
    const { error } = await supabase
      .from('jamstacksongs')
      .delete()
      .eq('song_id', songId)
      .eq('user_id', user.id);
    if (!error) setJamStackSongs((prev) => prev.filter((s) => s.id !== songId));
  };

  const updateSong = async (id, updates) => {
    if ('stripe_account_id' in updates && updates.stripe_account_id === 'FETCH_FROM_PROFILE') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_account_id')
        .eq('id', user.id)
        .maybeSingle();
      if (!profile?.stripe_account_id) {
        alert('You must connect Stripe in Settings to enable gifting.');
        return;
      }
      updates.stripe_account_id = profile.stripe_account_id;
    }
    const { error } = await supabase.from('songs').update(updates).eq('id', id);
    if (error) {
      console.error('❌ Error updating song:', error.message);
    } else {
      fetchUploads();
    }
  };

  const avatarSrc = profile.avatar_url?.trim()
    ? profile.avatar_url
    : user?.user_metadata?.avatar_url || '/default-avatar.png';

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <img src={avatarSrc} alt="avatar" className="w-24 h-24 rounded-full object-cover border shadow" />
        <div className="flex-1">
          <input
            type="text"
            value={profile.display_name || ''}
            onChange={(e) => handleChange('display_name', e.target.value)}
            placeholder="Display Name"
            className="text-xl font-bold w-full border-b p-1"
          />
          <textarea
            value={profile.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell us about you..."
            className="w-full mt-2 p-2 border rounded"
            rows={3}
          />
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">Upload Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="text-sm"
              disabled={uploading}
            />
          </div>
        </div>
      </div>

      {["booking_email", "website", "spotify", "youtube", "instagram", "soundcloud", "tiktok", "bandlab"].map((field) => (
        <div key={field} className="mb-2">
          <label className="block text-sm font-semibold capitalize">{field.replace('_', ' ')}</label>
          <input
            type="text"
            value={profile[field] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full p-2 border rounded"
            placeholder={`Enter your ${field}`}
          />
        </div>
      ))}

      <button
        onClick={handleSave}
        className="mt-4 bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
      >
        Save Profile
      </button>

      {message && <p className="mt-2 text-green-600">{message}</p>}

      {/* Collapsible Uploaded Songs */}
      <div className="mt-10">
        <button
          onClick={() => setShowUploads(!showUploads)}
          className="text-lg font-bold mb-2"
        >
          ⬆️ My Uploaded Songs {showUploads ? '▾' : '▸'}
        </button>
        {showUploads && (
          <ul className="space-y-4">
            {songs.map((song) => (
              <li key={song.id} className="bg-gray-100 p-4 rounded shadow">
                <div className="flex items-center space-x-4">
                  <img src={song.cover} alt="cover" className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1 space-y-1">
                    <input
                      value={song.title}
                      onChange={(e) => updateSong(song.id, { title: e.target.value })}
                      className="w-full border p-1 rounded"
                    />
                    <select
                      value={song.genre}
                      onChange={(e) => updateSong(song.id, { genre: e.target.value })}
                      className="w-full border p-1 rounded"
                    >
                      <option value="">Select genre</option>
                      {genreOptions.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!!song.stripe_account_id}
                        onChange={(e) =>
                          updateSong(song.id, {
                            stripe_account_id: e.target.checked ? 'FETCH_FROM_PROFILE' : null,
                          })
                        }
                      />
                      <label className="text-sm text-gray-600">Enable Gifting</label>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(song.id)}
                    className="text-red-500 hover:text-red-700"
                  >🗑️</button>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-600 mt-2">
                  <span>👁️ {song.views || 0}</span>
                  <span>❤️ {song.likes || 0}</span>
                  <span>🔥 {song.fires || 0}</span>
                  <span>😢 {song.sads || 0}</span>
                  <span>🎯 {song.bullseyes || 0}</span>
                  <span>📦 {song.jams || 0} Jams</span>
                  {tickleStats[song.id] &&
                    Object.entries(tickleStats[song.id]).map(([emoji, count]) => (
                      <span key={emoji}>{emoji} {count}</span>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Collapsible Jam Stack Songs */}
      <div className="mt-10">
        <button
          onClick={() => setShowJamStack(!showJamStack)}
          className="text-lg font-bold mb-2"
        >
          📦 My Jam Stack {showJamStack ? '▾' : '▸'}
        </button>
        {showJamStack && (
          <ul className="space-y-4">
            {jamStackSongs.map((song) => (
              <li key={song.id} className="bg-gray-100 p-4 rounded shadow">
                <div className="flex items-center space-x-4">
                  <img src={song.cover} alt="cover" className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{song.title}</p>
                    <audio src={song.audio} controls className="w-full" />
                  </div>
                  <button
                    onClick={() => handleDeleteJam(song.id)}
                    className="text-red-500 hover:text-red-700"
                  >🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;

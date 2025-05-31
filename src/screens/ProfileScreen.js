import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import SongCard from '../components/SongCard';
import AddToJamStackButton from '../components/AddToJamStackButton';

const ProfileScreen = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState({});
  const [songs, setSongs] = useState([]);
  const [jamSongs, setJamSongs] = useState([]);
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState({ uploads: false, jams: false });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchMySongs();
      fetchJamStack();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data || {});
  };

  const fetchMySongs = async () => {
    const { data } = await supabase.from('songs').select('*').eq('artist_id', user.id);
    setSongs(data || []);
  };

  const fetchJamStack = async () => {
    const { data } = await supabase
      .from('jamstacksongs')
      .select('songs:song_id(*)')
      .eq('user_id', user.id);
    setJamSongs(data.map(j => j.songs));
  };

  const handleSave = async () => {
    await supabase.from('profiles').update(profile).eq('id', user.id);
    setEditing(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `${fileName}`;

    await supabase.storage.from('avatars').upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

    const publicUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`;
    setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));

    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 text-white">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={profile.avatar_url || '/default-avatar.png'}
            alt="Avatar"
            className="w-20 h-20 rounded-full border border-gray-400 object-cover"
            onClick={() => document.getElementById('avatarUpload').click()}
          />
          <input
            type="file"
            id="avatarUpload"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div className="absolute bottom-0 right-0 text-xs bg-gray-700 px-1 rounded">✏️</div>
        </div>
        <div>
          {editing ? (
            <>
              <input
                value={profile.display_name || ''}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                className="bg-gray-800 px-2 py-1 rounded mb-1 w-full"
                placeholder="Display name"
              />
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="bg-gray-800 px-2 py-1 rounded w-full"
                placeholder="Bio"
              />
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold">{profile.display_name}</h2>
              <p className="text-gray-400 text-sm">{profile.bio}</p>
            </>
          )}
        </div>
      </div>

      <div className="mt-4">
        {editing ? (
          <button className="bg-green-600 px-4 py-1 rounded" onClick={handleSave}>Save</button>
        ) : (
          <button className="bg-blue-600 px-4 py-1 rounded" onClick={() => setEditing(true)}>Edit Profile</button>
        )}
      </div>

      {/* Uploaded Songs */}
      <div className="mt-6">
        <div
          className="cursor-pointer bg-zinc-800 px-4 py-2 rounded-t font-bold"
          onClick={() => setExpanded(prev => ({ ...prev, uploads: !prev.uploads }))}
        >
          🎵 Uploaded Songs ({songs.length}) {expanded.uploads ? '▲' : '▼'}
        </div>
        {expanded.uploads && (
          <div className="bg-zinc-900 p-4 rounded-b space-y-4">
            {songs.length === 0 && <div>No uploads yet.</div>}
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>

      {/* My Jams */}
      <div className="mt-6">
        <div
          className="cursor-pointer bg-zinc-800 px-4 py-2 rounded-t font-bold"
          onClick={() => setExpanded(prev => ({ ...prev, jams: !prev.jams }))}
        >
          🎧 My JamStack ({jamSongs.length}) {expanded.jams ? '▲' : '▼'}
        </div>
        {expanded.jams && (
          <div className="bg-zinc-900 p-4 rounded-b space-y-4">
            {jamSongs.length === 0 && <div>No songs in your stack yet.</div>}
            {jamSongs.map((song) => (
              <SongCard key={song.id} song={song}>
                <AddToJamStackButton songId={song.id} />
              </SongCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;

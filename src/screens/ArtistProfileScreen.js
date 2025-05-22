import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const ArtistProfileScreen = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url, display_name, bio')
        .eq('id', id)
        .single();

      if (profileError) {
        console.error('❌ Failed to load artist profile:', profileError);
        return;
      }

      setProfile(profileData);

      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('id, title, artist, cover')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (songsError) {
        console.error('❌ Failed to load artist songs:', songsError);
        return;
      }

      setSongs(songsData);
      setLoading(false);
    };

    fetchArtist();
  }, [id]);

  if (!profile) return <div className="text-white p-6">Loading artist profile...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={profile.avatar_url || '/default-avatar.png'}
          alt="avatar"
          className="w-20 h-20 object-cover rounded-full border-2 border-white"
        />
        <div>
          <h1 className="text-2xl font-bold">{profile.display_name || 'Unnamed Artist'}</h1>
          {profile.bio && <p className="text-sm text-gray-400 mt-1">{profile.bio}</p>}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">🎵 Songs by this artist</h2>

      {loading ? (
        <p>Loading songs...</p>
      ) : songs.length === 0 ? (
        <p className="text-gray-500">This artist hasn’t uploaded any songs yet.</p>
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
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-700 flex items-center justify-center rounded">
                  🎶
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{song.title || 'Untitled'}</h3>
                <p className="text-sm text-gray-400">{song.artist || 'Unknown Artist'}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ArtistProfileScreen;

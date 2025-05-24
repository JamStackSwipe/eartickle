import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';

const ArtistProfileScreen = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!id) {
        console.warn("⚠️ No artist ID in route.");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (profileError) {
        console.error("❌ Error fetching artist profile:", profileError.message);
      } else {
        console.log("🎨 Artist profile loaded:", profile);
      }

      const { data: uploads, error: songError } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (songError) {
        console.error("❌ Error fetching artist songs:", songError.message);
      }

      if (profile) setArtist(profile);
      if (uploads) setSongs(uploads);
      setLoading(false);
    };

    fetchArtist();
  }, [id]);

  if (loading) return <div className="p-6">Loading artist page...</div>;

  if (!artist) {
    return <div className="p-6 text-center text-gray-500">Artist not found.</div>;
  }

  const avatarSrc =
    artist?.avatar_url && artist.avatar_url.trim() !== ''
      ? artist.avatar_url
      : artist?.user_metadata?.avatar_url || '/default-avatar.png';

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={avatarSrc}
          alt="avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-avatar.png';
          }}
          className="w-20 h-20 rounded-full object-cover border"
        />
        <div>
          <h1 className="text-2xl font-bold">{artist.display_name || 'Unnamed Artist'}</h1>
          <p className="text-gray-600">{artist.bio || 'No bio available.'}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">🎵 Songs by this artist</h2>
      {songs.length === 0 ? (
        <p className="text-gray-500">This artist hasn’t uploaded any songs yet.</p>
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
              <div>
                <h3 className="text-lg font-semibold">{song.title}</h3>
                <p className="text-sm text-gray-500">{song.artist}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ArtistProfileScreen;

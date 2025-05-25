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
      if (!id) return;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Error fetching artist profile:', profileError.message);
      }

      const { data: uploads, error: songError } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (songError) {
        console.error('❌ Error fetching artist songs:', songError.message);
      }

      if (profile) setArtist(profile);
      if (uploads) setSongs(uploads);
      setLoading(false);
    };

    fetchArtist();
  }, [id]);

  if (loading) return <div className="p-6">Loading artist page...</div>;
  if (!artist) return <div className="p-6 text-center text-gray-500">Artist not found.</div>;

  const avatarSrc = artist.avatar_url?.trim()
    ? `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/${artist.avatar_url}`
    : artist.github_avatar_url || '/default-avatar.png';

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="flex items-center space-x-6 mb-6">
        <div className="flex-shrink-0">
          <img
            src={avatarSrc}
            alt="artist avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
            onError={(e) => {
              console.warn('🖼️ Avatar failed to load:', avatarSrc);
              e.target.onerror = null;
              e.target.src = '/default-avatar.png';
            }}
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{artist.display_name || 'Unnamed Artist'}</h1>
          <p className="text-gray-600">{artist.bio || 'No bio available.'}</p>

          {(artist.website || artist.spotify || artist.youtube || artist.instagram ||
            artist.soundcloud || artist.tiktok || artist.bandlab) && (
            <div className="mt-4">
              <p className="font-medium mb-2">🌐 Connect with me if you love my music!</p>
              <div className="flex flex-wrap gap-3 text-sm">
                {artist.website && (
                  <a href={artist.website} target="_blank" rel="noopener noreferrer" className="hover:underline">🌍 Website</a>
                )}
                {artist.spotify && (
                  <a href={artist.spotify} target="_blank" rel="noopener noreferrer" className="hover:underline">🎵 Spotify</a>
                )}
                {artist.youtube && (
                  <a href={artist.youtube} target="_blank" rel="noopener noreferrer" className="hover:underline">▶️ YouTube</a>
                )}
                {artist.instagram && (
                  <a href={artist.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline">📸 Instagram</a>
                )}
                {artist.soundcloud && (
                  <a href={artist.soundcloud} target="_blank" rel="noopener noreferrer" className="hover:underline">🌊 SoundCloud</a>
                )}
                {artist.tiktok && (
                  <a href={artist.tiktok} target="_blank" rel="noopener noreferrer" className="hover:underline">🎬 TikTok</a>
                )}
                {artist.bandlab && (
                  <a href={artist.bandlab} target="_blank" rel="noopener noreferrer" className="hover:underline">🎧 BandLab</a>
                )}
              </div>
            </div>
          )}

          {artist.booking_email && (
            <a
              href={`mailto:${artist.booking_email}?subject=Gig Inquiry from EarTickle`}
              className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              📩 Book This Artist
            </a>
          )}
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

export default ArtistProfileScreen;

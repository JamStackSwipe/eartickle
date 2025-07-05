import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import SongCard from '../components/SongCard';

const ArtistProfileScreen = () => {
  const { artistId } = useParams(); // Get artistId from the URL
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!artistId) return;

      // Fetch the artist profile using the artistId
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', artistId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching artist profile:', profileError.message);
      }

      const { data: uploads, error: songError } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', artistId)
        .order('created_at', { ascending: false });

      if (songError) {
        console.error('Error fetching artist songs:', songError.message);
      }

      if (profile) setArtist(profile);
      if (uploads) setSongs(uploads);
      setLoading(false);
    };

    fetchArtist();
  }, [artistId]);

  if (loading) return <div>Loading artist page...</div>;
  if (!artist) return <div>Artist not found.</div>;

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="flex items-center space-x-6 mb-6">
        <div className="flex-shrink-0">
          <img
            src={artist.avatar_url || '/default-avatar.png'}
            alt="artist avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{artist.display_name}</h1>
          <p>{artist.bio || 'No bio available'}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold">Songs by this artist</h2>
      <div>
        {songs.map(song => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
};

export default ArtistProfileScreen;

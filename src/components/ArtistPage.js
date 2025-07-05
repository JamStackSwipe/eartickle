import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import SongCard from './SongCard';

const ArtistPage = ({ id }) => {
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        console.log('ArtistPage: Fetching artist with ID:', id);
        // Fetch the artist profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        // Fetch the artist's songs
        const { data: songData, error: songError } = await supabase
          .from('songs')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: false });

        console.log('ArtistPage: Profile Response:', { profile, profileError });
        console.log('ArtistPage: Songs Response:', { songData, songError });

        if (profileError) throw new Error(`Profile error: ${profileError.message}`);
        if (songError) throw new Error(`Songs error: ${songError.message}`);

        setArtist(profile);
        setSongs(songData || []);
      } catch (err) {
        console.error('ArtistPage: Error fetching data:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [id]);

  if (loading) return <div>Loading artist profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!artist) return <div>Artist not found</div>;

  return (
    <div className="artist-profile">
      <div className="artist-header">
        <img
          src={artist.avatar_url || '/default-avatar.png'}
          alt={`${artist.display_name} avatar`}
          className="artist-avatar"
        />
        <h1 className="artist-name">{artist.display_name}</h1>
        <p className="artist-bio">{artist.bio || 'No bio available.'}</p>

        {artist.website || artist.spotify || artist.youtube || artist.instagram || artist.soundcloud || artist.tiktok || artist.bandlab ? (
          <div className="artist-links">
            {artist.website && <a href={artist.website} target="_blank" rel="noopener noreferrer">Website</a>}
            {artist.spotify && <a href={artist.spotify} target="_blank" rel="noopener noreferrer">Spotify</a>}
            {artist.youtube && <a href={artist.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>}
            {artist.instagram && <a href={artist.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
            {artist.soundcloud && <a href={artist.soundcloud} target="_blank" rel="noopener noreferrer">SoundCloud</a>}
            {artist.tiktok && <a href={artist.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>}
            {artist.bandlab && <a href={artist.bandlab} target="_blank" rel="noopener noreferrer">BandLab</a>}
          </div>
        ) : null}

        {artist.booking_email && (
          <a href={`mailto:${artist.booking_email}`} className="booking-link">
            Book this artist
          </a>
        )}
      </div>

      <div className="artist-songs">
        <h2>Songs by {artist.display_name}</h2>
        {songs.length === 0 ? (
          <p>No songs uploaded by this artist yet.</p>
        ) : (
          <ul>
            {songs.map((song) => (
              <li key={song.id}>
                <SongCard song={song} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ArtistPage;

// src/screens/ArtistPage.js
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import SongCard from '../components/SongCard'; // Assuming you have a SongCard component

const ArtistPage = () => {
  const { id } = useParams(); // Get the user ID from the URL parameters
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch artist data when the component mounts or when `id` changes
  useEffect(() => {
    const fetchArtistData = async () => {
      // Fetch the artist profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single(); // Single because we expect only one profile

      // Fetch the artist's songs
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (profileError) {
        console.error('Error fetching artist profile:', profileError);
      }
      if (songError) {
        console.error('Error fetching songs:', songError);
      }

      // Set artist data and songs
      setArtist(profile);
      setSongs(songData || []);
      setLoading(false);
    };

    fetchArtistData();
  }, [id]);

  // If the artist data is still loading, show a loading message
  if (loading) {
    return <div>Loading artist profile...</div>;
  }

  // If no artist data is found, display a not found message
  if (!artist) {
    return <div>Artist not found</div>;
  }

  // Render the artist's profile page
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

        {/* Social links */}
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

        {/* Booking info */}
        {artist.booking_email && (
          <a href={`mailto:${artist.booking_email}`} className="booking-link">
            Book this artist
          </a>
        )}
      </div>

      {/* Display songs by the artist */}
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

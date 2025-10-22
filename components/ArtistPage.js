// pages/artist/[id].js – Neon migration (SSR fetch); fixed for Next.js
import { useState, useEffect } from 'react';
import SongCard from '../components/SongCard'; // Adjust path if needed

export default function ArtistPage({ artist, songs, id }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
}

// SSR: Fetch artist + songs server-side (Neon)
export async function getServerSideProps({ params }) {
  const { id } = params;

  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    const { rows: profileRows } = await sql`SELECT * FROM profiles WHERE id = ${id};`;
    const artist = profileRows[0] || null;

    const { rows: songRows } = await sql`SELECT * FROM songs WHERE user_id = ${id} ORDER BY created_at DESC;`;
    const songs = songRows || [];

    return { props: { artist, songs, id } };
  } catch (error) {
    console.error('Artist fetch error:', error);
    return { props: { artist: null, songs: [], id } };
  }
}

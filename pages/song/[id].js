// pages/song/[id].js – Dynamic route with SSR song fetch (Neon) + wrapper
import Header from '../../components/Header'; // Flattened: Drop src/ if in pages root; adjust to '../components/Header' if moved
import Footer from '../../components/Footer';
import SongPage from '../../screens/SongPage'; // Same flatten

export default function Song({ song, id }) { // Props from getServerSideProps
  if (!song) {
    return <div>404: Song not found</div>; // Graceful fallback
  }

  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <SongPage song={song} id={id} /> {/* Pass song data down */}
      </main>
      <Footer />
    </div>
  );
}

// SSR fetch: Load song by ID on server (Neon; no client leak)
export async function getServerSideProps({ params }) {
  const { id } = params;

  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    const { rows } = await sql`SELECT * FROM songs WHERE id = ${id};`;
    const song = rows[0] || null;

    return {
      props: { song, id }, // Pass to component
    };
  } catch (error) {
    console.error('Song fetch error:', error);
    return {
      props: { song: null, id },
    };
  }
}

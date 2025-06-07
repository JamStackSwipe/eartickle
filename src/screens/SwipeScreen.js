import { useEffect, useState } from 'react';
import { useUser } from '../components/AuthProvider';
import { getRecommendedSongs } from '../utils/recommendationEngine';
import SongCard from '../components/SongCard';
import { genreFlavorMap } from '../utils/genreList';

const SwipeScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null); // Default to null for "All"
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      getRecommendedSongs(user.id).then((allSongs) => {
        console.log('All Songs from Engine:', allSongs.map(s => ({ id: s.id, genre_flavor: s.genre_flavor, score: s.score })));
        const filteredSongs = selectedGenre
          ? allSongs.filter(song => song.genre_flavor.toLowerCase() === selectedGenre.toLowerCase())
          : allSongs;
        console.log('Filtered Songs for', selectedGenre || 'All:', filteredSongs.map(s => ({ id: s.id, genre_flavor: s.genre_flavor, score: s.score })));
        setSongs(filteredSongs);
      }).catch(console.error);
    }
  }, [user, selectedGenre]);

  return (
    <div className="p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center" style={{ color: '#3FD6CD' }}>Discover Songs</h1>
      <div className="flex justify-center mb-6">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="bg-white border-l-4 p-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center"
            style={{ borderColor: '#3FD6CD', color: '#3FD6CD' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
            <span className="ml-2">{selectedGenre ? genreFlavorMap[selectedGenre]?.label || 'All' : 'All'}</span>
          </button>
          {menuOpen && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
              <button
                onClick={() => { setSelectedGenre(null); setMenuOpen(false); }}
                className="block w-full text-left p-2 hover:bg-gray-100 rounded-t-lg"
              >
                All
              </button>
              {Object.keys(genreFlavorMap).map((genre) => (
                <button
                  key={genre}
                  onClick={() => { setSelectedGenre(genre); setMenuOpen(false); }}
                  className="block w-full text-left p-2 hover:bg-gray-100"
                  style={{
                    borderLeftColor: genreFlavorMap[genre].color + '-600',
                    color: genreFlavorMap[genre].color + '-800',
                  }}
                >
                  {genreFlavorMap[genre].emoji} {genreFlavorMap[genre].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {songs.length > 0 ? (
        songs.map((song) => <SongCard key={song.id} song={song} user={user} />)
      ) : (
        <p className="text-center text-gray-500">No songs to discover in this genre yet.</p>
      )}
    </div>
  );
};

// Helper function to get glow color (unchanged for now)
const getGlowColor = (color) => {
  switch (color) {
    case 'amber': return '#f59e0b';
    case 'blue': return '#3b82f6';
    case 'pink': return '#ec4899';
    case 'purple': return '#a855f7';
    case 'cyan': return '#06b6d4';
    case 'red': return '#ef4444';
    case 'lime': return '#a3e635'; // Ensure this matches comedy_other
    default: return '#ffffff';
  }
};

export default SwipeScreen;

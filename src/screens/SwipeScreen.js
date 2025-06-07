import { useEffect, useState } from 'react';
import { useUser } from '../components/AuthProvider';
import { getRecommendedSongs } from '../utils/recommendationEngine';
import MySongCard from '../components/MySongCard';
import { genreFlavorMap } from '../utils/genreList';

const SwipeScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  useEffect(() => {
    if (user) {
      getRecommendedSongs(user.id).then((allSongs) => {
        console.log('All Songs from Engine:', allSongs.map(s => ({ id: s.id, genre_flavor: s.genre_flavor, score: s.score })));
        const filteredSongs = selectedGenre
          ? allSongs.filter(song => song.genre_flavor === selectedGenre)
          : allSongs;
        console.log('Filtered Songs for', selectedGenre || 'All:', filteredSongs.map(s => ({ id: s.id, genre_flavor: s.genre_flavor, score: s.score })));
        setSongs(filteredSongs);
      }).catch(console.error);
    }
  }, [user, selectedGenre]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4" style={{ color: '#3FD6CD' }}>Discover Songs</h1>
      <div className="space-y-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setSelectedGenre(null)}
            className="bg-white border-l-4 p-2 rounded-lg shadow-md hover:shadow-lg transition-all"
            style={{ borderColor: '#3FD6CD', color: '#3FD6CD' }}
          >
            All
          </button>
          {Object.keys(genreFlavorMap).map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`bg-white border-l-4 p-2 rounded-lg shadow-md hover:shadow-lg transition-all ${selectedGenre === genre ? 'ring-2' : ''}`}
              style={{
                borderColor: genreFlavorMap[genre].color + '-600',
                color: genreFlavorMap[genre].color + '-800',
                boxShadow: selectedGenre === genre ? `0 0 10px ${getGlowColor(genreFlavorMap[genre].color)}` : 'none',
              }}
            >
              {genreFlavorMap[genre].emoji} {genreFlavorMap[genre].label}
            </button>
          ))}
        </div>
      </div>
      {songs.length > 0 ? (
        songs.map((song) => <MySongCard key={song.id} song={song} user={user} stats={song} />)
      ) : (
        <p className="text-center text-gray-500">No songs to discover in this genre yet.</p>
      )}
    </div>
  );
};

// Helper function to get glow color
const getGlowColor = (color) => {
  switch (color) {
    case 'amber': return '#f59e0b';
    case 'blue': return '#3b82f6';
    case 'pink': return '#ec4899';
    case 'purple': return '#a855f7';
    case 'cyan': return '#06b6d4';
    case 'red': return '#ef4444';
    case 'lime': return '#a3e635';
    default: return '#ffffff';
  }
};

export default SwipeScreen;

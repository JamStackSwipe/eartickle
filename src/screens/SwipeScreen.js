import { useEffect, useState } from 'react';
import { useUser } from '../components/AuthProvider';
import { getRecommendedSongs } from '../utils/recommendationEngine';
import MySongCard from '../components/MySongCard';

const genreFlavors = [
  'country_roots',
  'hiphop_flow',
  'rock_raw',
  'pop_shine',
  'spiritual_soul',
  'comedy_other',
];

const SwipeScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  useEffect(() => {
    if (user) {
      getRecommendedSongs(user.id).then((allSongs) => {
        const filteredSongs = selectedGenre
          ? allSongs.filter(song => song.genre_flavor === selectedGenre)
          : allSongs;
        setSongs(filteredSongs);
      }).catch(console.error);
    }
  }, [user, selectedGenre]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4" style={{ color: '#3FD6CD' }}>Discover Songs</h1>
      <div className="space-y-4 mb-6">
        <div
          className="bg-white border-l-4 p-4 shadow-lg rounded-lg"
          style={{ borderColor: '#3FD6CD' }}
        >
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`px-3 py-1 rounded-full ${!selectedGenre ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-700`}
            >
              All
            </button>
            {genreFlavors.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-full ${selectedGenre === genre ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-700`}
              >
                {genre.replace('_', ' ').charAt(0).toUpperCase() + genre.slice(1)}
              </button>
            ))}
          </div>
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

export default SwipeScreen;

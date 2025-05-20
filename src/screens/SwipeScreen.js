import React, { useEffect, useState } from "react";

const SwipeScreen = () => {
  const [songs, setSongs] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      const mockSongs = [
        { id: "1", title: "Bow My Head", artist: "Jolie Grace", cover: "https://via.placeholder.com/280" },
        { id: "2", title: "My Friends Are Ghosts", artist: "Jolie Grace", cover: "https://via.placeholder.com/280" },
      ];
      setSongs(mockSongs);
      setLoading(false);
    };

    fetchSongs();
  }, []);

  const handleSwipeRight = () => {
    console.log("Liked:", songs[index]?.title);
    setIndex((prev) => (prev + 1) % songs.length);
  };

  const handleSwipeLeft = () => {
    console.log("Skipped:", songs[index]?.title);
    setIndex((prev) => (prev + 1) % songs.length);
  };

  const currentSong = songs[index];

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading songs...</div>;
  }

  if (!currentSong) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">No more songs to swipe!</div>;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-8 text-white">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-full max-w-xs text-center">
        <img src={currentSong.cover} alt={currentSong.title} className="w-72 h-72 object-cover rounded-lg mb-4" />
        <h2 className="text-2xl font-bold">{currentSong.title}</h2>
        <p className="text-gray-400">by {currentSong.artist}</p>
      </div>
      <div className="mt-6 flex gap-6">
        <button onClick={handleSwipeLeft} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-semibold">Skip</button>
        <button onClick={handleSwipeRight} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-semibold">Add to JamStack</button>
      </div>
    </div>
  );
};

export default SwipeScreen;
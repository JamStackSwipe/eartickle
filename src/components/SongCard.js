// src/components/SongCard.js
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactionStatsBar from './ReactionStatsBar';
import { genreFlavorMap } from '../utils/genreList'; // contains color/emoji by genre

const SongCard = ({ songId, artistId, title, artist, audio, cover, genre }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const flavor = genreFlavorMap[genre] || { label: genre, emoji: '', color: 'gray' };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      document.querySelectorAll('audio').forEach((a) => a.pause()); // Stop others
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto bg-black rounded-2xl shadow-md overflow-hidden mb-6 border-2 border-${flavor.color}-500`}>
      {/* Cover + Genre Glow */}
      <div className="relative">
        <img
          src={cover}
          alt={title}
          className={`w-full h-64 object-cover border-b-2 border-${flavor.color}-500`}
        />
        <div className={`absolute top-2 left-2 bg-${flavor.color}-700 text-white text-xs px-2 py-1 rounded`}>
          {flavor.emoji} {flavor.label}
        </div>
      </div>

      {/* Title + Artist */}
      <div className="px-4 py-3">
        <h2 className="text-xl font-bold text-white truncate">{title}</h2>
        <Link to={`/artist/${artistId}`} className="text-sm text-pink-300 hover:underline">
          {artist}
        </Link>
      </div>

      {/* Audio Controls */}
      <div className="px-4 pb-3">
        <audio ref={audioRef} src={audio} preload="metadata" onEnded={() => setIsPlaying(false)} />
        <button
          onClick={togglePlay}
          className="w-full bg-gray-800 text-white rounded px-4 py-2 mt-2 hover:bg-gray-700 transition"
        >
          {isPlaying ? '⏸ Pause' : '▶️ Play Preview'}
        </button>
      </div>

      {/* Reaction Bar */}
      <div className="px-2 pb-4">
        <ReactionStatsBar
          songId={songId}
          artistId={artistId}
          cover={cover}
          artist={artist}
          genre={genre}
        />
      </div>
    </div>
  );
};

export default SongCard;

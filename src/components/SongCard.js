// src/components/SongCard.js
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactionStatsBar from './ReactionStatsBar';

const getFlavor = (genre) => {
  switch (genre) {
    case 'Country':
      return { label: 'Country', emoji: '🤠', ring: 'ring-yellow-400' };
    case 'Christian':
      return { label: 'Christian', emoji: '🙏', ring: 'ring-blue-400' };
    case 'Pop':
      return { label: 'Pop', emoji: '🎤', ring: 'ring-pink-400' };
    case 'Hip-Hop':
      return { label: 'Hip-Hop', emoji: '🎧', ring: 'ring-red-400' };
    case 'Rock':
      return { label: 'Rock', emoji: '🎸', ring: 'ring-orange-400' };
    default:
      return { label: genre, emoji: '🎵', ring: 'ring-gray-500' };
  }
};

const SongCard = ({ songId, artistId, title, artist, audio, cover, genre }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const flavor = getFlavor(genre);

  useEffect(() => {
    const stopOthers = () => {
      document.querySelectorAll('audio').forEach((el) => {
        if (el !== audioRef.current) el.pause();
      });
    };
    stopOthers();
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    if (audio.paused) {
      document.querySelectorAll('audio').forEach((a) => {
        if (a !== audio) a.pause();
      });
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-black text-white rounded-2xl shadow-xl overflow-hidden mb-6">
      {/* Album Cover */}
      <div className="relative">
        <img
          src={cover}
          alt={title}
          className={`w-full h-64 object-cover ring-4 ${flavor.ring}`}
        />
        {/* Genre Badge */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-xs px-3 py-1 rounded-full shadow">
          {flavor.emoji} {flavor.label}
        </div>
      </div>

      {/* Title and Artist */}
      <div className="px-4 py-3">
        <h2 className="text-xl font-semibold truncate">{title}</h2>
        <Link
          to={`/artist/${artistId}`}
          className="text-sm text-pink-300 hover:underline"
        >
          {artist}
        </Link>
      </div>

      {/* Audio Player */}
      <div className="px-4 pb-3">
        <audio
          ref={audioRef}
          src={audio}
          preload="metadata"
          onEnded={() => setIsPlaying(false)}
        />
        <button
          onClick={togglePlay}
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition"
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

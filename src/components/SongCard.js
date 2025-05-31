import React, { useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import AddToJamStackButton from './AddToJamStackButton';
import SendTickleButton from './SendTickleButton'; // Optional - stubbed for now
import { useUser } from './AuthProvider';

const SongCard = ({ song, onSwipeLeft, onSwipeRight }) => {
  const { user } = useUser();
  const audioRef = useRef(null);

  const handlePlay = () => {
    // Pause all other audio elements
    document.querySelectorAll('audio').forEach((audio) => {
      if (audio !== audioRef.current) audio.pause();
    });
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (onSwipeLeft) onSwipeLeft(song);
    },
    onSwipedRight: () => {
      if (onSwipeRight) onSwipeRight(song);
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div {...handlers} className="bg-zinc-900 rounded-xl shadow-md p-4 mb-10">
      <a href={`/artist/${song.artist_id}`}>
        <img
          src={song.cover}
          alt={song.title}
          className="w-full h-auto rounded-xl mb-4"
        />
      </a>
      <h2 className="text-xl font-semibold text-white mb-1 text-center">{song.title}</h2>
      <p className="text-sm text-gray-400 mb-2 text-center">by {song.artist}</p>

      <audio
        ref={audioRef}
        src={song.audio}
        controls
        preload="none"
        className="w-full mb-2"
        onPlay={handlePlay}
      />

      <div className="flex flex-col items-center space-y-2">
        <AddToJamStackButton songId={song.id} />
        {/* Uncomment when ready */}
        {/* <SendTickleButton songId={song.id} artistId={song.artist_id} /> */}

        <div className="text-xs text-gray-400 mt-2 text-center">
          👁️ {song.views || 0} | 🎧 {song.jams || 0} | 🔥 {song.fires || 0} | ❤️ {song.loves || 0} | 😢 {song.sads || 0} | 🎯 {song.bullseyes || 0}
        </div>
      </div>
    </div>
  );
};

export default SongCard;

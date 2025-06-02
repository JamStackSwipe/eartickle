import React from 'react';
import { useRouter } from 'next/router';

const MySongCard = ({ song, stats = {}, onDelete, onEditCover, onPublish }) => {
  const router = useRouter();

  const handleCardClick = () => {
    if (song.artist_id) {
      router.push(`/artist/${song.artist_id}`);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg shadow-md mb-4 p-4">
      <div className="flex items-center gap-4">
        {/* Cover Image */}
        <div className="relative w-16 h-16 cursor-pointer" onClick={handleCardClick}>
          <img
            src={song.cover || '/default-cover.png'}
            alt={song.title}
            className="w-16 h-16 object-cover rounded"
          />
          {onEditCover && (
            <div
              className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onEditCover(song.id);
              }}
            >
              📷
            </div>
          )}
        </div>

        {/* Song Details */}
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold truncate">{song.title}</div>
          <div className="text-sm text-gray-400 truncate">{song.artist}</div>

          <div className="flex gap-3 mt-1 text-sm text-gray-400 flex-wrap">
            <span>🔥 {stats[song.id]?.['🔥'] || 0}</span>
            <span>💖 {stats[song.id]?.['💖'] || 0}</span>
            <span>😢 {stats[song.id]?.['😢'] || 0}</span>
            <span>🎯 {stats[song.id]?.['🎯'] || 0}</span>
            <span>👁️ {stats[song.id]?.views || 0}</span>
            <span>📥 {stats[song.id]?.jam_saves || 0}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-end gap-1">
          {onPublish && song.is_draft && (
            <button
              onClick={() => onPublish(song.id)}
              className="text-xs text-yellow-300 bg-zinc-800 px-2 py-1 rounded"
            >
              Publish
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(song.id)}
              className="text-xs text-red-400 hover:text-red-600"
            >
              🗑 Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySongCard;

// Updated MySongCard to show all stats: 🔥 💖 😭 🎯 + views + jam saves
import React from 'react';
import { useNavigate } from 'react-router-dom';

const MySongCard = ({ song, stats = {}, compact, editable, onDelete, onDeleteWithConfirm, onPublish, showStripeButton }) => {
  const navigate = useNavigate();

  const handleClickCover = () => {
    if (song.artist_id) navigate(`/artist/${song.artist_id}`);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-4 relative">
      <div className="w-16 h-16 flex-shrink-0 cursor-pointer" onClick={handleClickCover}>
        <img
          src={song.cover || '/default-cover.png'}
          alt={song.title}
          className="w-full h-full object-cover rounded"
        />
      </div>
      <div className="flex-1">
        <div className="text-lg font-semibold truncate">{song.title}</div>
        <div className="flex flex-wrap text-sm text-gray-500 space-x-3 mt-1">
          {stats['🔥'] ? <span>🔥 {stats['🔥']}</span> : null}
          {stats['💖'] ? <span>💖 {stats['💖']}</span> : null}
          {stats['😭'] ? <span>😭 {stats['😭']}</span> : null}
          {stats['🎯'] ? <span>🎯 {stats['🎯']}</span> : null}
          {stats.views ? <span>👀 {stats.views}</span> : null}
          {stats.jam_saves ? <span>🎵 {stats.jam_saves}</span> : null}
        </div>
        {editable && (
          <div className="flex space-x-3 mt-2">
            <button
              onClick={() => onDelete?.(song.id)}
              className="text-red-600 hover:underline text-sm"
            >
              Delete
            </button>
            {song.is_draft && (
              <button
                onClick={() => onPublish?.(song.id)}
                className="text-green-600 hover:underline text-sm"
              >
                Publish
              </button>
            )}
            {showStripeButton && (
              <button
                onClick={() => navigate('/settings')}
                className="text-blue-600 hover:underline text-sm"
              >
                Connect Stripe
              </button>
            )}
          </div>
        )}
        {onDeleteWithConfirm && (
          <button
            onClick={onDeleteWithConfirm}
            className="text-red-600 text-sm mt-2 hover:underline"
          >
            Remove from My Jam Stack
          </button>
        )}
      </div>
    </div>
  );
};

export default MySongCard;

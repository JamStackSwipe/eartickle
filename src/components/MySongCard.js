// MySongCard.js - now with emojiIcons mapping and clean profile-ready layout
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

const emojiIcons = {
  '🔥': '🔥',
  '💖': '💖',
  '😢': '😭', // map sad to cry
  '🎯': '🎯',
  views: '👁️',
  jamstack: '➕'
};

const MySongCard = ({
  song,
  stats = {},
  onDelete,
  onEditCover,
  onPublish,
  editableTitle = false,
}) => {
  const [title, setTitle] = useState(song.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const inputRef = useRef();

  const id = song.id;
  const songStats = stats[id] || {};
  const views = songStats.views || 0;
  const jamstack = songStats.jam_saves || 0;

  const handleTitleSave = async () => {
    setIsEditingTitle(false);
    if (title !== song.title) {
      await supabase.from('songs').update({ title }).eq('id', id);
    }
  };

  useEffect(() => {
    if (isEditingTitle) {
      inputRef.current?.focus();
    }
  }, [isEditingTitle]);

  return (
    <div className="flex items-center justify-between bg-zinc-900 rounded-lg p-3 mb-3 shadow">
      <div className="flex items-center gap-3">
        <Link to={`/artist/${song.artist_id || ''}`} className="relative w-16 h-16 block group">
          <img
            src={song.cover || '/default-cover.png'}
            alt={title}
            className="w-16 h-16 object-cover rounded group-hover:opacity-80 transition"
          />
          {onEditCover && (
            <div
              onClick={(e) => {
                e.preventDefault();
                onEditCover(id);
              }}
              className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded cursor-pointer"
            >
              📷
            </div>
          )}
        </Link>

        <div>
          {isEditingTitle && editableTitle ? (
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              className="bg-zinc-800 text-white px-2 py-1 rounded"
            />
          ) : (
            <div
              className="font-semibold text-white cursor-pointer"
              onClick={() => editableTitle && setIsEditingTitle(true)}
            >
              {title}
            </div>
          )}

          {song.is_draft && (
            <button
              onClick={() => onPublish?.(id)}
              className="mt-1 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded hover:bg-yellow-500"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {['🔥', '💖', '😢', '🎯'].map((emoji) => (
          <span key={emoji} className="text-sm text-white flex items-center gap-1">
            {emojiIcons[emoji]}
            <span className="text-gray-300">{songStats[emoji] || 0}</span>
          </span>
        ))}
        <span className="text-sm text-white">{emojiIcons.views} {views}</span>
        <span className="text-sm text-white">{emojiIcons.jamstack} {jamstack}</span>

        {onDelete && (
          <button
            onClick={() => onDelete(id)}
            className="ml-2 text-red-400 text-sm hover:text-red-600"
          >
            ❌
          </button>
        )}
      </div>
    </div>
  );
};

export default MySongCard;

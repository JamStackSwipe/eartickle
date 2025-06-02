// used for profile page so pleae dont delete me
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

const emojiIcons = {
  '🔥': '🔥',
  '💖': '💖',
  '😭': '😭',
  '🎯': '🎯',
  views: '👁️',
  jamstack: '➕'
};

const MySongCard = ({
  song,
  stats = null,
  onDelete,
  onEditCover,
  onPublish,
  editableTitle = false,
}) => {
  const [title, setTitle] = useState(song.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [songStats, setSongStats] = useState({});
  const inputRef = useRef();

  useEffect(() => {
    if (stats && stats[song.id]) {
      setSongStats(stats[song.id]);
    } else {
      fetchStats();
    }
  }, [song.id, stats]);

  const fetchStats = async () => {
    const [{ data: reactions }, { data: views }, { data: jams }] = await Promise.all([
      supabase.from('reactions').select('emoji').eq('song_id', song.id),
      supabase.from('views').select('song_id').eq('song_id', song.id),
      supabase.from('jamstacksongs').select('song_id').eq('song_id', song.id),
    ]);

    const counts = {};
    reactions?.forEach(({ emoji }) => {
      counts[emoji] = (counts[emoji] || 0) + 1;
    });
    counts.views = views?.length || 0;
    counts.jam_saves = jams?.length || 0;

    setSongStats(counts);
  };

  const handleTitleSave = async () => {
    setIsEditingTitle(false);
    if (title !== song.title) {
      await supabase.from('songs').update({ title }).eq('id', song.id);
    }
  };

  useEffect(() => {
    if (isEditingTitle) inputRef.current?.focus();
  }, [isEditingTitle]);

  return (
    <div className="flex items-center justify-between bg-zinc-900 rounded-lg p-4 mb-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        {/* Cover image + edit icon */}
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
                onEditCover(song.id);
              }}
              className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded cursor-pointer"
            >
              📷
            </div>
          )}
        </Link>

        {/* Title, Edit, Draft button */}
        <div className="flex flex-col">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                className="bg-zinc-800 text-white px-2 py-1 rounded w-full"
              />
              <button
                onClick={handleTitleSave}
                className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-white font-semibold">
              <span>{title}</span>
              {editableTitle && (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="text-gray-400 hover:text-blue-500"
                >
                  ✏️
                </button>
              )}
            </div>
          )}

          {song.is_draft && (
            <button
              onClick={() => onPublish?.(song.id)}
              className="mt-2 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded hover:bg-yellow-500"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      {/* Stats and Delete */}
      <div className="flex items-center flex-wrap justify-end gap-3 text-white text-sm">
        {['🔥', '💖', '😭', '🎯'].map((emoji) => (
          <span key={emoji} className="flex items-center gap-1">
            {emojiIcons[emoji]} {songStats[emoji] || 0}
          </span>
        ))}
        <span>{emojiIcons.views} {songStats.views || 0}</span>
        <span>{emojiIcons.jamstack} {songStats.jam_saves || 0}</span>

        {onDelete && (
          <button
            onClick={() => onDelete(song.id)}
            className="ml-2 text-red-400 hover:text-red-600"
          >
            ❌
          </button>
        )}
      </div>
    </div>
  );
};

export default MySongCard;

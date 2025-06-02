import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

const emojiIcons = {
  '🔥': '🔥',
  '💖': '💖',
  '😢': '😭',
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
      fetchStats(); // fallback
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
                onEditCover(song.id);
              }}
              className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded cursor-pointer"
            >
              📷
            </div>
          )}
        </Link>

        <div className="relative group">
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
            <>
              <div className="font-semibold text-white">
                {title}
              </div>
              {editableTitle && (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="absolute -right-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </>
          )}
          
          {song.is_draft && (
            <button
              onClick={() => onPublish?.(song.id)}
              className="mt-1 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded hover:bg-yellow-500"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-white text-sm">
        {['🔥', '💖', '😢', '🎯'].map((emoji) => (
          <span key={emoji} className="flex items-center gap-1">
            {emojiIcons[emoji]} {songStats[emoji] || 0}
          </span>
        ))}
        <span>{emojiIcons.views} {songStats.views || 0}</span>
        <span>{emojiIcons.jamstack} {songStats.jam_saves || 0}</span>

        {onDelete && (
          <button
            onClick={() => onDelete(song.id)}
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

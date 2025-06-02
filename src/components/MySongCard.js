// For The Profile Page Same Base Logic as SongCard.js but has the profile CRUD
// Added Some Styling For My Jams
import React from 'react';
import { useUser } from './AuthProvider';
import { supabase } from '../supabase';
import ReactionStatsBar from './ReactionStatsBar';

const MySongCard = ({ song, onEdit, onDelete, onPublish, variant }) => {
  const { user } = useUser();

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this song?');
    if (confirmDelete) {
      const { error } = await supabase.from('songs').delete().eq('id', song.id);
      if (error) {
        console.error('❌ Error deleting song:', error.message);
      } else {
        onDelete?.(song.id);
      }
    }
  };

  const handlePublish = async () => {
    const { error } = await supabase
      .from('songs')
      .update({ is_draft: false })
      .eq('id', song.id);
    if (error) {
      console.error('❌ Error publishing song:', error.message);
    } else {
      onPublish?.(song.id);
    }
  };

  const cardStyle = variant === 'jamstack'
    ? 'bg-blue-50 ring-2 ring-purple-300'
    : 'bg-white';

  return (
    <div className={`relative p-4 rounded-2xl shadow-md ${cardStyle}`}>
      {variant === 'jamstack' && (
        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow">
          🎵 My Jam
        </div>
      )}
      {song.is_draft && (
        <div className="absolute top-2 right-2 text-xs bg-yellow-400 text-white px-2 py-1 rounded-full">
          Draft
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{song.title}</h3>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
        {song.genre && <span>🎶 {song.genre}</span>}
        {song.created_at && <span>📅 {new Date(song.created_at).toLocaleDateString()}</span>}
      </div>

      <audio controls className="w-full mt-3" src={song.audio_url}>
        Your browser does not support the audio element.
      </audio>

      <div className="flex gap-2 mt-3">
        {onEdit && (
          <button
            onClick={() => onEdit(song)}
            className="text-blue-600 border border-blue-600 px-2 py-1 rounded hover:bg-blue-100 text-sm"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            className="text-red-600 border border-red-600 px-2 py-1 rounded hover:bg-red-100 text-sm"
          >
            Delete
          </button>
        )}
        {song.is_draft && onPublish && (
          <button
            onClick={handlePublish}
            className="text-green-600 border border-green-600 px-2 py-1 rounded hover:bg-green-100 text-sm"
          >
            Publish
          </button>
        )}
      </div>

      <div className="mt-4">
        <ReactionStatsBar songId={song.id} />
      </div>
    </div>
  );
};

export default MySongCard;

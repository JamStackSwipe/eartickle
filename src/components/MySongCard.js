// For The Profile Page Same Base Logic as SongCard.js but has the profile CRUD
import React from 'react';
import { playAudioPreview } from '../utils/audioPlayer'; // Assuming this handles playback
import { useUser } from './AuthProvider';
import { supabase } from '../supabase';

const MySongCard = ({ song, onEdit, onDelete, onPublish }) => {
  const { user } = useUser();

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this song?');
    if (confirmDelete) {
      const { error } = await supabase.from('songs').delete().eq('id', song.id);
      if (error) {
        console.error('❌ Error deleting song:', error.message);
      } else {
        onDelete?.(song.id); // Let parent refresh the list
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
      onPublish?.(song.id); // Let parent refresh the list
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mb-4 flex flex-col gap-2 relative">
      {song.is_draft && (
        <div className="absolute top-2 right-2 text-xs bg-yellow-400 text-white px-2 py-1 rounded-full">
          Draft
        </div>
      )}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{song.title}</h3>
        <button onClick={() => playAudioPreview(song.audio_url)}>
          🔊
        </button>
      </div>
      <div className="flex items-center justify-start gap-2 text-sm text-gray-600">
        {song.genre && <span>🎵 {song.genre}</span>}
        {song.created_at && <span>📅 {new Date(song.created_at).toLocaleDateString()}</span>}
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onEdit(song)}
          className="text-blue-600 border border-blue-600 px-2 py-1 rounded hover:bg-blue-100 text-sm"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 border border-red-600 px-2 py-1 rounded hover:bg-red-100 text-sm"
        >
          Delete
        </button>
        {song.is_draft && (
          <button
            onClick={handlePublish}
            className="text-green-600 border border-green-600 px-2 py-1 rounded hover:bg-green-100 text-sm"
          >
            Publish
          </button>
        )}
      </div>
    </div>
  );
};

export default MySongCard;

// For The Profile Page Same Base Logic as SongCard.js but has the profile CRUD
// Added Some Styling For My Jams
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import ReactionStatsBar from './ReactionStatsBar';
import toast from 'react-hot-toast';

const tickleSound = new Audio('/sounds/tickle.mp3');

const MySongCard = ({ song, variant, onDelete, onPublish }) => {
  if (!song || !song.id || !song.artist_id) return null;

  const {
    id,
    title,
    audio_url,
    cover_url,
    is_draft,
    created_at,
    fires = 0,
    loves = 0,
    sads = 0,
    bullseyes = 0,
  } = song;

  const [localReactions, setLocalReactions] = useState({ fires, loves, sads, bullseyes });

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('fires, loves, sads, bullseyes')
        .eq('id', id)
        .single();

      if (data) {
        setLocalReactions({
          fires: data.fires || 0,
          loves: data.loves || 0,
          sads: data.sads || 0,
          bullseyes: data.bullseyes || 0,
        });
      }
    };

    fetchStats();
  }, [id]);

  const handleDelete = () => {
    if (onDelete) onDelete(id);
  };

  const handlePublish = () => {
    if (onPublish) onPublish(id);
  };

  return (
    <div
      className={`rounded-2xl p-4 shadow-md bg-white border relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
        variant === 'jamstack' ? 'ring-2 ring-blue-500 shadow-blue-200' : ''
      }`}
    >
      {variant === 'jamstack' && (
        <div className="absolute top-2 right-2 text-sm bg-blue-500 text-white px-2 py-1 rounded shadow">
          🎧 My Jam
        </div>
      )}
      <div className="flex items-center space-x-4">
        <img
          src={cover_url || '/placeholder.jpg'}
          alt={title}
          className="w-20 h-20 rounded-lg object-cover border"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold truncate">{title}</h3>
          <audio controls className="w-full mt-1">
            <source src={audio_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>

      {song && song.id && song.artist_id && (
        <div className="mt-2">
          <ReactionStatsBar song={{ ...song, user_id: song.artist_id }} />
        </div>
      )}

      <div className="flex justify-end space-x-2 mt-3">
        {typeof is_draft === 'boolean' && is_draft && onPublish && (
          <button
            onClick={handlePublish}
            className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
          >
            Publish
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default MySongCard;

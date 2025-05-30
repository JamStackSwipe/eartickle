// src/components/JamStackView.js
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const JamStackView = ({ jamstack }) => {
  const [songsByStack, setSongsByStack] = useState({});

  useEffect(() => {
    const fetchSongs = async () => {
      const songMap = {};

      for (const stack of jamstack) {
        const { data, error } = await supabase
          .from('jamstack_songs')
          .select(`
            song_id,
            songs (
              id,
              title,
              artist,
              cover,
              audio
            )
          `)
          .eq('jamstack_id', stack.id);

        if (!error && data) {
          songMap[stack.id] = data.map((row) => row.songs);
        }
      }

      setSongsByStack(songMap);
    };

    if (jamstack.length > 0) fetchSongs();
  }, [jamstack]);

  if (!jamstack || jamstack.length === 0) {
    return <p className="text-gray-400">You haven’t created any JamStacks yet.</p>;
  }

  return (
    <div className="space-y-6">
      {jamstack.map((stack) => (
        <div key={stack.id} className="border p-4 rounded shadow bg-white dark:bg-gray-800">
          <h2 className="text-lg font-bold">{stack.title || 'Untitled'}</h2>
          {stack.description && (
            <p className="text-sm text-gray-400 mb-2">{stack.description}</p>
          )}

          {songsByStack[stack.id] ? (
            <ul className="space-y-2">
              {songsByStack[stack.id].map((song) => (
                <li key={song.id} className="flex items-center gap-3">
                  {song.cover && (
                    <img src={song.cover} alt="cover" className="w-12 h-12 object-cover rounded" />
                  )}
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-gray-500">{song.artist}</p>
                  </div>
                  <audio controls src={song.audio} className="ml-auto w-32" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Loading songs...</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default JamStackView;

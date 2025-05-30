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
          .from('jamstacksongs')
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
        } else {
          console.error(`❌ Error fetching songs for stack ${stack.id}`, error);
        }
      }

      setSongsByStack(songMap);
    };

    if (jamstack?.length > 0) fetchSongs();
  }, [jamstack]);

  if (!jamstack || jamstack.length === 0) {
    return <p className="text-gray-400">You haven’t created any JamStacks yet.</p>;
  }

  return (
    <div className="space-y-6">
      {jamstack.map((stack) => (
        <div key={stack.id} className="border p-4 rounded-xl shadow bg-white dark:bg-gray-900">
          <h2 className="text-xl font-bold text-black dark:text-white">{stack.title || 'Untitled Stack'}</h2>
          {stack.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{stack.description}</p>
          )}

          {songsByStack[stack.id] ? (
            <ul className="space-y-3 mt-3">
              {songsByStack[stack.id].map((song) => (
                <li key={song.id} className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  {song.cover && (
                    <img
                      src={song.cover}
                      alt="cover"
                      className="w-14 h-14 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-black dark:text-white">{song.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{song.artist}</p>
                  </div>
                  <audio controls src={song.audio} className="w-32" />
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

// src/screens/ChartsScreen.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import SongCard from '../components/SongCard';
import { useUser } from '../components/AuthProvider';

const FILTER_OPTIONS = [
  { key: 'views', label: '🔥 Top' },
  { key: 'loves', label: '❤️ Loved' },
  { key: 'fires', label: '🔥 Fire' },
  { key: 'bullseyes', label: '🎯 Bullseye' },
  { key: 'jams', label: '📥 Jammed' },
  { key: 'tickles', label: '🎁 Tickled' } // optional if tracked
];

const ChartsScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('views');

  useEffect(() => {
    const fetchChartSongs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order(filter, { ascending: false })
        .limit(20);

      if (error) console.error('Error fetching chart songs:', error.message);
      else setSongs(data);

      setLoading(false);
    };

    fetchChartSongs();
  }, [filter]);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-zinc-900 text-center">
  {emojiMap[filter]} {filter.charAt(0).toUpperCase() + filter.slice(1)} Top 20 Chart
</h1>


      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 text-sm rounded-full font-semibold transition-colors duration-150 ${
              filter === f.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-white">Loading songs...</div>
      ) : (
        <div className="space-y-6">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChartsScreen;

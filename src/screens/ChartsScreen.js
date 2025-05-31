// src/screens/ChartsScreen.js

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

const chartViews = [
  { label: 'Weekly', table: 'weekly_top_songs' },
  { label: 'Monthly', table: 'monthly_top_songs' },
  { label: 'Yearly', table: 'yearly_top_songs' },
  { label: 'All-Time', table: 'all_time_top_songs' },
];

const ChartsScreen = () => {
  const [songs, setSongs] = useState([]);
  const [activeChart, setActiveChart] = useState(chartViews[0].table);

  useEffect(() => {
    const fetchChart = async () => {
      const { data, error } = await supabase
        .from(activeChart)
        .select('song_id, avg_score')
        .order('avg_score', { ascending: false });

      if (!error && data?.length) {
        const ids = data.map((row) => row.song_id);
        const { data: songsData } = await supabase
          .from('songs')
          .select('*')
          .in('id', ids);

        const merged = data.map((entry, i) => {
          const full = songsData.find((s) => s.id === entry.song_id);
          return {
            ...full,
            avg_score: entry.avg_score,
            rank: i + 1,
          };
        });

        setSongs(merged);
      }
    };

    fetchChart();
  }, [activeChart]);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-3xl font-bold text-center mb-6">🎶 Top Charts</h1>

      <div className="flex justify-center mb-4 gap-3 flex-wrap">
        {chartViews.map((c) => (
          <button
            key={c.table}
            onClick={() => setActiveChart(c.table)}
            className={`px-4 py-2 rounded ${
              activeChart === c.table ? 'bg-green-600' : 'bg-gray-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map((song) => (
          <div
            key={song.id}
            className="bg-white text-black p-4 rounded-xl shadow relative"
          >
            <span className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
              #{song.rank}
            </span>
            <Link to={`/artist/${song.user_id}`}>              
              <img
                src={song.cover || '/default-cover.png'}
                alt={song.title}
                className="w-full h-48 object-cover rounded mb-3"
              />
            </Link>
            <h2 className="text-lg font-bold">{song.title}</h2>
            <p className="text-sm text-gray-600">{song.artist}</p>
            <p className="text-xs text-gray-400 italic mb-2">Genre: {song.genre}</p>
            <p className="text-xs">🔥 Score: {song.avg_score}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartsScreen;

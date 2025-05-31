import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import AddToJamStackButton from '../components/AddToJamStackButton';

const StackerScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchJamStack = async () => {
      const { data, error } = await supabase
        .from('jamstacksongs')
        .select('id, song_id, songs:song_id(id, title, artist, artist_id, cover, audio, views, jams, fires, loves, sads, bullseyes)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading JamStack:', error.message);
      } else {
        setSongs(data.map(item => item.songs));
      }
    };

    fetchJamStack();
  }, [user.id]);

  const playSound = (emoji) => {
    let sound;
    switch (emoji) {
      case '❤️': sound = new Audio('/sounds/love.mp3'); break;
      case '🔥': sound = new Audio('/sounds/fire.mp3'); break;
      case '😢': sound = new Audio('/sounds/sad.mp3'); break;
      case '🎯': sound = new Audio('/sounds/bullseye.mp3'); break;
      default: return;
    }
    sound.play();
  };

  const handleReaction = async (emoji, songId) => {
    playSound(emoji);
    const column = {
      '❤️': 'loves',
      '🔥': 'fires',
      '😢': 'sads',
      '🎯': 'bullseyes'
    }[emoji];

    if (!column) return;

    await supabase
      .from('songs')
      .update({ [column]: supabase.raw(`${column} + 1`) })
      .eq('id', songId);
  };

  const handleNext = () => {
    if (audioRef.current) audioRef.current.pause();
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
  };

  const currentSong = songs[currentSongIndex];

  if (!currentSong) return <div className="text-white text-center mt-10">No songs in your JamStack yet.</div>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="text-center text-white text-2xl font-bold mb-6">
        <img src="/logo.png" alt="EarTickle Logo" className="w-10 h-10 inline-block mr-2 align-middle" />
        🔀 JamStack Stacker
      </div>
      <div className="bg-zinc-900 rounded-xl shadow-md p-4 text-white">
        <a href={`/artist/${currentSong.artist_id}`}>
          <img src={currentSong.cover} alt={currentSong.title} className="w-full h-auto rounded-xl mb-4" />
        </a>
        <h2 className="text-xl font-semibold mb-1">{currentSong.title}</h2>
        <p className="text-sm text-gray-400 mb-2">by {currentSong.artist}</p>
        <audio
          ref={audioRef}
          src={currentSong.audio}
          controls
          autoPlay
          className="w-full mb-2"
        />
        <div className="flex justify-center space-x-4 my-2">
          {['🔥', '❤️', '😢', '🎯'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji, currentSong.id)}
              className="text-2xl hover:scale-110 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
        <AddToJamStackButton songId={currentSong.id} />
        <div className="text-center text-xs text-gray-400 mt-2">
          👁️ {currentSong.views || 0} | 🎧 {currentSong.jams || 0} | 🔥 {currentSong.fires || 0} | ❤️ {currentSong.loves || 0} | 😢 {currentSong.sads || 0} | 🎯 {currentSong.bullseyes || 0}
        </div>
        <div className="text-center mt-4">
          <button
            onClick={handleNext}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
          >
            Next Song
          </button>
        </div>
      </div>
    </div>
  );
};

export default StackerScreen;

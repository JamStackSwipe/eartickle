import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import AddToJamStackButton from '../components/AddToJamStackButton';
import { useSwipeable } from 'react-swipeable';

const SwipeScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swipeMessage, setSwipeMessage] = useState('');

  const addSound = useRef(null);
  const mehSound = useRef(null);

  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading songs:', error.message);
      } else {
        setSongs(data);
      }
      setLoading(false);
    };

    fetchSongs();
  }, []);

  const incrementViews = async (songId) => {
    await supabase.rpc('increment_song_view', { song_id_input: songId });
  };

  const handleRightSwipe = async (songId) => {
    if (!user || !songId) return;

    const { data: existing, error } = await supabase
      .from('jamstacksongs')
      .select('id')
      .eq('user_id', user.id)
      .eq('song_id', songId);

    if (existing && existing.length > 0) {
      setSwipeMessage('🔁 Already in My Jams. Keep Scrolling!');
    } else {
      await supabase.from('jamstacksongs').insert([{ user_id: user.id, song_id: songId }]);
      setSwipeMessage('✅ Added to My Jams');
    }
    if (addSound.current) addSound.current.play();
    setTimeout(() => setSwipeMessage(''), 3000);
  };

  const handleLeftSwipe = () => {
    if (mehSound.current) mehSound.current.play();
    setSwipeMessage('🙃 Skipped. Keep Scrolling!');
    setTimeout(() => setSwipeMessage(''), 3000);
  };

  if (loading) {
    return <div className="text-center mt-10 text-white">Loading songs...</div>;
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-10">
      <audio ref={addSound} src="/sounds/add.mp3" preload="auto" />
      <audio ref={mehSound} src="/sounds/meh.mp3" preload="auto" />
      {songs.map((song) => {
        const swipeHandlers = useSwipeable({
          onSwipedLeft: () => handleLeftSwipe(),
          onSwipedRight: () => handleRightSwipe(song.id),
          preventDefaultTouchmoveEvent: true,
          trackMouse: true,
        });

        return (
          <div
            key={song.id}
            className="bg-zinc-900 rounded-xl shadow-md p-4"
            {...swipeHandlers}
          >
            <a href={`/artist/${song.artist_id}`}>
              <img
                src={song.cover}
                alt={song.title}
                className="w-full h-auto rounded-xl mb-4"
                onClick={() => incrementViews(song.id)}
              />
            </a>
            <h2 className="text-xl font-semibold text-white mb-1">{song.title}</h2>
            <p className="text-sm text-gray-400 mb-2">by {song.artist}</p>
            <audio
              src={song.audio}
              controls
              className="w-full mb-2"
              onPlay={() => incrementViews(song.id)}
            />
            <div className="flex flex-col items-center space-y-2">
              <AddToJamStackButton songId={song.id} />
              <div className="text-xs text-gray-400">
                👁️ {song.views || 0} | 🎧 {song.jams || 0} | 🔥 {song.fires || 0} | ❤️ {song.loves || 0} | 😢 {song.sads || 0} | 🎯 {song.bullseyes || 0}
              </div>
            </div>
          </div>
        );
      })}
      {swipeMessage && (
        <div className="fixed bottom-6 left-0 right-0 text-center text-white text-lg font-semibold">
          {swipeMessage}
        </div>
      )}
    </div>
  );
};

export default SwipeScreen;

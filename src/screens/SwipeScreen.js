import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import { useSwipeable } from 'react-swipeable';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';

const reactionEmojis = ['🔥', '❤️', '😢', '🎯'];

const SwipeScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const [userHasTapped, setUserHasTapped] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const audioRef = useRef();

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data.length > 0) {
      setSongs(data);
    }
  };

  const incrementViews = async (songId) => {
    await supabase.rpc('increment_song_views', { song_id: songId });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, songs.length - 1));
    incrementViews(songs[Math.min(currentIndex + 1, songs.length - 1)]?.id);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleAddToJamStack = async () => {
    if (!user || adding) return;
    setAdding(true);
    const currentSong = songs[currentIndex];

    const { data: existing } = await supabase
      .from('jamstacksongs')
      .select('id')
      .eq('user_id', user.id)
      .eq('song_id', currentSong.id)
      .maybeSingle();

    if (existing) {
      alert('🛑 Already in your JamStack!');
      setAdding(false);
      return;
    }

    const { error } = await supabase.from('jamstacksongs').insert([
      {
        id: uuidv4(),
        user_id: user.id,
        song_id: currentSong.id,
      },
    ]);

    if (!error) {
      alert('🎵 Added to your JamStack!');
    } else {
      console.error('❌ Error adding to JamStack:', error);
    }

    setAdding(false);
  };

  const playReactionSound = (emoji) => {
    let soundFile = null;
    if (emoji === '🔥') soundFile = '/sounds/fire.mp3';
    if (emoji === '❤️') soundFile = '/sounds/love.mp3';
    if (emoji === '😢') soundFile = '/sounds/sad.mp3';
    if (emoji === '🎯') soundFile = '/sounds/bullseye.mp3';

    if (soundFile) {
      const audio = new Audio(soundFile);
      audio.play();
    }
  };

  const handleReact = async (emoji) => {
    const currentSong = songs[currentIndex];
    if (!user || !currentSong?.id) return;

    await supabase.from('reactions').insert([
      {
        id: uuidv4(),
        user_id: user.id,
        song_id: currentSong.id,
        emoji: emoji,
      },
    ]);

    playReactionSound(emoji);
  };

  const handleFirstTap = () => {
    setUserHasTapped(true);
    setS

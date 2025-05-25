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
      .select(`
        *,
        profiles:profiles!songs_user_id_fkey(id, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (!error && data.length > 0) {
      const enriched = data.map((song) => ({
        ...song,
        artist_avatar_url: song.profiles?.avatar_url,
      }));
      setSongs(enriched);
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
      console.error('❌ Error adding to JamStack:', e

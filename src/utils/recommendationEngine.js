// src/utils/recommendationEngine.js

import { supabase } from '../supabase';

export async function getRecommendedSongs(userId) {
  // Step 1: Pull song list
  const { data: songs, error: songError } = await supabase
    .from('songs')
    .select('*')
    .neq('audio', null);

  if (songError || !songs) return [];

  // Step 2: Pull user data
  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_genres')
    .eq('id', userId)
    .maybeSingle();

  // Step 3: Pull user interactions (JamStack adds, Tickles, skips)
  const { data: jams } = await supabase
    .from('jamstacksongs')
    .select('song_id')
    .eq('user_id', userId);

  const { data: tickles } = await supabase
    .from('tickles')
    .select('song_id')
    .eq('sender_id', userId);

  // Step 4: Score each song
  const songScores = songs.map((song) => {
    let score = 0;

    // JamStack add
    if (jams?.some((j) => j.song_id === song.id)) score += 10;

    // Gifting bonus
    if (tickles?.some((t) => t.song_id === song.id)) score += 25;

    // Genre match (soft bias)
    if (profile?.preferred_genres?.includes(song.genre)) score += 5;

    return { ...song, score };
  });

  // Step 5: Sort by score (desc)
  return songScores.sort((a, b) => b.score - a.score);
}

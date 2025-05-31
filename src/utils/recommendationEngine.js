// src/utils/recommendationEngine.js

import { supabase } from '../supabase';

export async function getRecommendedSongs(userId) {
  // Step 1: Fetch all songs with audio
  const { data: songs, error: songError } = await supabase
    .from('songs')
    .select('*')
    .neq('audio', null);

  if (songError || !songs) {
    console.error('❌ Failed to fetch songs:', songError);
    return [];
  }

  // Step 2: Get user profile preferences
  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_genres')
    .eq('id', userId)
    .maybeSingle();

  // Step 3: User interaction history
  const { data: jams } = await supabase
    .from('jamstacksongs')
    .select('song_id')
    .eq('user_id', userId);

  const { data: tickles } = await supabase
    .from('tickles')
    .select('song_id')
    .eq('sender_id', userId);

  // Step 4: Enrich each song with reaction counts, jam count, etc.
  const enriched = await Promise.all(
    songs.map(async (song) => {
      let score = 0;

      // Personal interaction scoring
      if (jams?.some((j) => j.song_id === song.id)) score += 10;
      if (tickles?.some((t) => t.song_id === song.id)) score += 25;
      if (profile?.preferred_genres?.includes(song.genre)) score += 5;

      // Emoji reactions (❤️ 🔥 😢 🎯)
      const { data: allReactions } = await supabase
        .from('reactions')
        .select('emoji')
        .eq('song_id', song.id);

      const emojiCounts = { '❤️': 0, '🔥': 0, '😢': 0, '🎯': 0 };
      allReactions?.forEach(({ emoji }) => {
        if (emojiCounts[emoji] !== undefined) emojiCounts[emoji]++;
      });

      // Jam count (headless count)
      const { count: jamCount } = await supabase
        .from('jamstacksongs')
        .select('*', { count: 'exact', head: true })
        .eq('song_id', song.id);

      return {
        ...song,
        score,
        likes: emojiCounts['❤️'],
        fires: emojiCounts['🔥'],
        sads: emojiCounts['😢'],
        bullseyes: emojiCounts['🎯'],
        jams: jamCount || 0,
        views: song.views || 0, // fallback to 0 if null
      };
    })
  );

  // Step 5: Sort enriched songs by descending score
  return enriched.sort((a, b) => b.score - a.score);
}

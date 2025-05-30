// src/utils/recommendationEngine.js

import { supabase } from '../supabase';

export async function getRecommendedSongs(userId) {
  // Step 1: Pull song list
  const { data: songs, error: songError } = await supabase
    .from('songs')
    .select('*')
    .neq('audio', null);

  if (songError || !songs) return [];

  // Step 2: Pull user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_genres')
    .eq('id', userId)
    .maybeSingle();

  // Step 3: Pull user interactions
  const { data: jams } = await supabase
    .from('jamstacksongs')
    .select('song_id')
    .eq('user_id', userId);

  const { data: tickles } = await supabase
    .from('tickles')
    .select('song_id')
    .eq('sender_id', userId);

  // Step 4: Enrich each song with score + public stats
  const enriched = await Promise.all(
    songs.map(async (song) => {
      let score = 0;

      // Personalized scoring
      if (jams?.some((j) => j.song_id === song.id)) score += 10;
      if (tickles?.some((t) => t.song_id === song.id)) score += 25;
      if (profile?.preferred_genres?.includes(song.genre)) score += 5;

      // Public stats (emoji reactions)
      const { data: allTickles } = await supabase
        .from('tickles')
        .select('emoji')
        .eq('song_id', song.id);

      const emojiCounts = { '❤️': 0, '🔥': 0, '😢': 0, '🎯': 0 };
      allTickles?.forEach((t) => {
        if (emojiCounts[t.emoji] !== undefined) {
          emojiCounts[t.emoji]++;
        }
      });

      // Jam count
      const { data: jamCountData } = await supabase
        .from('jamstacksongs')
        .select('id', { count: 'exact', head: true })
        .eq('song_id', song.id);

      return {
        ...song,
        score,
        likes: emojiCounts['❤️'],
        fires: emojiCounts['🔥'],
        sads: emojiCounts['😢'],
        bullseyes: emojiCounts['🎯'],
        jams: jamCountData?.length || 0,
      };
    })
  );

  // Step 5: Sort by score (desc)
  return enriched.sort((a, b) => b.score - a.score);
}

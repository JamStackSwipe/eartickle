// src/utils/recommendationEngine.js
import { supabase } from '../supabase';

export async function getRecommendedSongs(userId) {
  let songs;
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .neq('audio', null)
      .order('created_at', { ascending: false });
    if (error || !data) {
      console.error('Song fetch error:', error);
      return [];
    }
    songs = data;
  } catch (error) {
    console.error('Song fetch failed:', error);
    return [];
  }

  console.log('Raw songs fetched:', songs.length);
  console.log('Raw songs genres:', songs.map(s => s.genre_flavor));

  let profile;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('preferred_genres')
      .eq('id', userId)
      .maybeSingle();
    if (error) console.error('Profile fetch error:', error);
    profile = data;
  } catch (error) {
    console.error('Profile fetch failed:', error);
    profile = null;
  }

  let jams;
  try {
    const { data, error } = await supabase
      .from('jamstacksongs')
      .select('song_id')
      .eq('user_id', userId);
    if (error) console.error('Jams fetch error:', error);
    jams = data || [];
  } catch (error) {
    console.error('Jams fetch failed:', error);
    jams = [];
  }

  let tickles;
  try {
    const { data, error } = await supabase
      .from('tickles')
      .select('song_id')
      .eq('user_id', userId);
    if (error) {
      console.warn('Tickles fetch failed, using empty data:', error);
      tickles = [];
    } else {
      tickles = data || [];
    }
  } catch (error) {
    console.warn('Tickles fetch failed, using empty data:', error);
    tickles = [];
  }

  const enriched = await Promise.all(
    songs.map(async (song) => {
      let score = 0;
      const now = new Date();
      const createdAt = new Date(song.created_at || now);
      const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
      const recencyBonus = daysSinceCreation < 7 ? 50 / (daysSinceCreation + 1) : 0;

      if (jams.some((j) => j.song_id === song.id)) score += 10;
      if (tickles.some((t) => t.song_id === song.id)) score += 25;
      if (profile?.preferred_genres?.includes(song.genre)) score += 5;
      score += recencyBonus;

      let allTickles;
      try {
        const { data, error } = await supabase
          .from('tickles')
          .select('emoji')
          .eq('song_id', song.id);
        if (error) console.warn(`Tickles error for song ${song.id}:`, error);
        allTickles = data || [];
      } catch (error) {
        console.warn(`Tickles error for song ${song.id}:`, error);
        allTickles = [];
      }

      const emojiCounts = { '❤️': 0, '🔥': 0, '😢': 0, '🎯': 0 };
      allTickles.forEach((t) => {
        if (emojiCounts[t.emoji] !== undefined) emojiCounts[t.emoji]++;
      });

      let jamCount;
      try {
        const { count, error } = await supabase
          .from('jamstacksongs')
          .select('*', { count: 'exact', head: true })
          .eq('song_id', song.id);
        if (error) console.error('Jam count error:', error);
        jamCount = count || 0;
      } catch (error) {
        console.error('Jam count failed:', error);
        jamCount = 0;
      }

      let boostCount = 0; // Skip boosts table

      score +=
        emojiCounts['❤️'] * 2 +
        emojiCounts['🔥'] * 3 +
        emojiCounts['😢'] +
        emojiCounts['🎯'] * 4 +
        (jamCount || 0) * 2 +
        boostCount * 10;

      try {
        const { error: updateError } = await supabase
          .from('songs')
          .update({ score })
          .eq('id', song.id)
          .eq('user_id', userId)
          .select();
        if (updateError) throw updateError;

        // Commented out to avoid 400s
        /*
        const { error: snapshotError } = await supabase.from('song_score_snapshots').insert([
          { song_id: song.id, score, snapshot_type: 'daily', taken_at: new Date().toISOString() },
        ]);
        if (snapshotError) throw snapshotError;
        */
      } catch (error) {
        console.error(`Score update error for song ${song.id}:`, error);
      }

      return {
        ...song,
        score,
        likes: emojiCounts['❤️'],
        fires: emojiCounts['🔥'],
        sads: emojiCounts['😢'],
        bullseyes: emojiCounts['🎯'],
        jams: jamCount || 0,
        boosts: boostCount || 0,
        views: song.views || 0,
      };
    })
  );

  for (let i = enriched.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [enriched[i], enriched[j]] = [enriched[j], enriched[i]];
  }
  return enriched.sort((a, b) => b.score - a.score);
}

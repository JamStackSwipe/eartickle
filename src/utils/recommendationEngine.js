// src/utils/recommendationEngine.js
import { supabase } from '../supabase';

export async function getRecommendedSongs(userId) {
  // Fetch all songs without limit
  const { data: songs, error: songError } = await supabase
    .from('songs')
    .select('*')
    .neq('audio', null)
    .order('created_at', { ascending: false });

  if (songError || !songs) {
    console.error('Song fetch error:', songError);
    return [];
  }

  console.log('Raw songs fetched:', songs.length); // Debug total songs
  console.log('Raw songs genres:', songs.map(s => s.genre_flavor)); // Debug genre distribution

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('preferred_genres')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) console.error('Profile fetch error:', profileError);

  const { data: jams, error: jamsError } = await supabase
    .from('jamstacksongs')
    .select('song_id')
    .eq('user_id', userId)
    .catch(() => ({ data: [] }));

  if (jamsError) console.error('Jams fetch error:', jamsError);

  const { data: tickles, error: ticklesError } = await supabase
    .from('tickles')
    .select('song_id')
    .eq('sender_id', userId)
    .catch((err) => {
      console.warn('Tickles fetch failed, using empty data:', err);
      return { data: [] };
    });

  const enriched = await Promise.all(
    songs.map(async (song) => {
      let score = 0;
      const now = new Date();
      const createdAt = new Date(song.created_at || now);
      const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
      const recencyBonus = daysSinceCreation < 7 ? 50 / (daysSinceCreation + 1) : 0;

      if (jams?.some((j) => j.song_id === song.id)) score += 10;
      if (tickles?.some((t) => t.song_id === song.id)) score += 25; // Adjusted for direct data access
      if (profile?.preferred_genres?.includes(song.genre)) score += 5;
      score += recencyBonus;

      const { data: allTickles, error: allTicklesError } = await supabase
        .from('tickles')
        .select('emoji')
        .eq('song_id', song.id)
        .catch(() => ({ data: [] }));

      if (allTicklesError) console.warn(`Tickles error for song ${song.id}:`, allTicklesError);

      const emojiCounts = { '❤️': 0, '🔥': 0, '😢': 0, '🎯': 0 };
      allTickles?.forEach((t) => {
        if (emojiCounts[t.emoji] !== undefined) emojiCounts[t.emoji]++;
      });

      const { count: jamCount, error: jamCountError } = await supabase
        .from('jamstacksongs')
        .select('*', { count: 'exact', head: true })
        .eq('song_id', song.id)
        .catch(() => ({ count: 0 }));

      if (jamCountError) console.error('Jam count error:', jamCountError);

      const { count: boostCount, error: boostCountError } = await supabase
        .from('boosts')
        .select('*', { count: 'exact', head: true })
        .eq('song_id', song.id)
        .catch(() => ({ count: 0 }));

      if (boostCountError) console.warn('Boosts table not found, skipping boosts:', boostCountError);

      score +=
        emojiCounts['❤️'] * 2 +
        emojiCounts['🔥'] * 3 +
        emojiCounts['😢'] +
        emojiCounts['🎯'] * 4 +
        (jamCount || 0) * 2 +
        (boostCount || 0) * 10;

      try {
        const { error: updateError } = await supabase
          .from('songs')
          .update({ score })
          .eq('id', song.id)
          .select();
        if (updateError) throw updateError;

        const { error: snapshotError } = await supabase.from('song_score_snapshots').insert([
          { song_id: song.id, score, snapshot_type: 'daily', created_at: new Date().toISOString() },
        ]);
        if (snapshotError) throw snapshotError;
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

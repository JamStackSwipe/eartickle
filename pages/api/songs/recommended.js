// utils/recommendationEngine.js – Neon migration (API fetches)
export async function getRecommendedSongs(userId) {
  try {
    const res = await fetch(`/api/songs/recommended?user_id=${userId}`);
    const songs = await res.json();
    if (!res.ok) throw new Error(songs.error);
    return songs;
  } catch (error) {
    console.error('Song fetch error:', error);
    return [];
  }
}

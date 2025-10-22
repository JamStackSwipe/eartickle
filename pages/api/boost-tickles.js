import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { user_id, artist_id, song_id, amount, reason } = req.body;
  const sql = neon(process.env.DATABASE_URL);
  try {
    // Deduct from user
    await sql`UPDATE profiles SET tickle_balance = tickle_balance - ${amount} WHERE id = ${user_id};`;
    // Add to artist
    await sql`UPDATE profiles SET tickle_balance = tickle_balance + ${amount} WHERE id = ${artist_id};`;
    // Log boost
    await sql`INSERT INTO boosts (user_id, artist_id, song_id, amount, reason) VALUES (${user_id}, ${artist_id}, ${song_id}, ${amount}, ${reason});`;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error });
  }
}

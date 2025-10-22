// pages/api/songs/[id]/view.js (POST)
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { id } = req.query;
  const sql = neon(process.env.DATABASE_URL);
  try {
    await sql`UPDATE songs SET views = views + 1 WHERE id = ${id};`;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error });
  }
}

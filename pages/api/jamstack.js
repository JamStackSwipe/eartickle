// pages/api/jamstack.js – GET list, DELETE remove (Neon)
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  const { user_id, song_id } = req.query || req.body;

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT js.*, s.* FROM jamstacksongs js JOIN songs s ON js.song_id = s.id WHERE js.user_id = ${user_id};`;
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE' && song_id) {
    try {
      await sql`DELETE FROM jamstacksongs WHERE user_id = ${user_id} AND song_id = ${song_id};`;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

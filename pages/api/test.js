// pages/api/test.js – Your Neon ping
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { rows } = await sql`SELECT COUNT(*) as count FROM songs LIMIT 1;`; // Swap 'songs' for one of your 5 tables
    res.status(200).json({ success: true, testCount: rows[0].count, tables: 'Neon connected!' });
  } catch (error) {
    console.error('Neon test error:', error);
    res.status(500).json({ error: error.message });
  }
}

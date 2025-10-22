import { sql } from '@vercel/postgres';
import { supabase } from '../../../src/supabase'; // Temporary auth

export default async function handler(req, res) {
  // Get user from Supabase auth (temporarily)
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid authentication' });
  }

  try {
    const { rows } = await sql`
      SELECT 
        s.id,
        s.title,
        s.artist,
        s.audio_url,
        s.cover_url
      FROM jamstack_songs js
      JOIN songs s ON js.song_id = s.id
      WHERE js.user_id = ${user.id}
      ORDER BY js.added_at DESC
    `;

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching JamStack:', error);
    res.status(500).json({ error: 'Failed to fetch JamStack' });
  }
}

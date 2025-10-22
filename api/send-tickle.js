// pages/api/send-tickle.js
import { sql } from '@vercel/postgres';
import { supabase } from '../../src/supabase'; // Temporary auth check

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { song_id, emoji, artist_id } = req.body;

    // Validate input
    if (!song_id || !emoji) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: !song_id ? 'Missing song_id' : 'Missing emoji',
      });
    }

    // Verify authentication (using Supabase temporarily)
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({
        error: 'Invalid authentication',
        details: userError?.message,
      });
    }

    const senderId = user.id;

    // Get sender's tickle balance
    const { rows: senderRows } = await sql`
      SELECT tickle_balance 
      FROM profiles 
      WHERE id = ${senderId}
    `;

    if (!senderRows.length || senderRows[0].tickle_balance < 1) {
      return res.status(400).json({ error: 'Insufficient Tickles' });
    }

    // Get song and artist info
    const { rows: songRows } = await sql`
      SELECT user_id 
      FROM songs 
      WHERE id = ${song_id}
    `;

    if (!songRows.length) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const receiverId = artist_id || songRows[0].user_id;

    // Can't send tickles to yourself
    if (senderId === receiverId) {
      return res.status(400).json({ error: 'Cannot send Tickles to yourself' });
    }

    // Deduct 1 tickle from sender
    await sql`
      UPDATE profiles 
      SET tickle_balance = tickle_balance - 1
      WHERE id = ${senderId}
    `;

    // Add 1 tickle to receiver (artist)
    await sql`
      UPDATE profiles 
      SET tickle_balance = tickle_balance + 1
      WHERE id = ${receiverId}
    `;

    // Record the transaction
    await sql`
      INSERT INTO tickle_transactions (sender_id, receiver_id, song_id, amount)
      VALUES (${senderId}, ${receiverId}, ${song_id}, 1)
    `;

    // Update song score
    await sql`
      UPDATE songs 
      SET score = score + 10
      WHERE id = ${song_id}
    `;

    console.log('✅ Tickle sent:', { senderId, receiverId, song_id });

    return res.status(200).json({
      success: true,
      message: 'Tickle sent successfully',
    });

  } catch (err) {
    console.error('Server Error:', {
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

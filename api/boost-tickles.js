// pages/api/boost-tickles.js — Handles Boost Tickles independently of Send Tickle
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.error('❌ Invalid method');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { user_id, artist_id, song_id, amount, reason } = req.body;
    console.log('⚡ Boost Tickles Request:', req.body);

    // Check user's tickle balance
    const { rows: userRows } = await sql`
      SELECT tickle_balance 
      FROM profiles 
      WHERE id = ${user_id}
    `;

    if (!userRows.length || userRows[0].tickle_balance < amount) {
      return res.status(400).json({ error: 'Insufficient Tickles' });
    }

    // Deduct tickles from user
    await sql`
      UPDATE profiles 
      SET tickle_balance = tickle_balance - ${amount}
      WHERE id = ${user_id}
    `;

    // Add tickles to artist (if different from user)
    if (artist_id && artist_id !== user_id) {
      await sql`
        UPDATE profiles 
        SET tickle_balance = tickle_balance + ${amount}
        WHERE id = ${artist_id}
      `;
    }

    // Record the transaction
    await sql`
      INSERT INTO tickle_transactions (sender_id, receiver_id, song_id, amount)
      VALUES (${user_id}, ${artist_id}, ${song_id}, ${amount})
    `;

    // Update song score
    await sql`
      UPDATE songs 
      SET score = score + ${amount * 10}
      WHERE id = ${song_id}
    `;

    console.log('✅ Boost successful');
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Uncaught error in boost-tickles:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

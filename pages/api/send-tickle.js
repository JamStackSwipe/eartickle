// pages/api/send-tickle.js – Neon migration + NextAuth
import { neon } from '@neondatabase/serverless';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]'; // Your NextAuth config

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { song_id, emoji, artist_id } = req.body;
    if (!song_id || !emoji) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // NextAuth session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const senderId = session.user.id;

    // Sender balance
    const { rows: senderRows } = await sql`SELECT tickle_balance FROM profiles WHERE id = ${senderId};`;
    if (!senderRows.length || senderRows[0].tickle_balance < 1) {
      return res.status(400).json({ error: 'Insufficient Tickles' });
    }

    // Song & receiver
    const { rows: songRows } = await sql`SELECT user_id FROM songs WHERE id = ${song_id};`;
    if (!songRows.length) {
      return res.status(404).json({ error: 'Song not found' });
    }
    const receiverId = artist_id || songRows[0].user_id;

    if (senderId === receiverId) {
      return res.status(400).json({ error: 'Cannot send to yourself' });
    }

    // Transactions
    await sql`UPDATE profiles SET tickle_balance = tickle_balance - 1 WHERE id = ${senderId};`;
    await sql`UPDATE profiles SET tickle_balance = tickle_balance + 1 WHERE id = ${receiverId};`;
    await sql`INSERT INTO tickle_transactions (sender_id, receiver_id, song_id, amount) VALUES (${senderId}, ${receiverId}, ${song_id}, 1);`;
    await sql`UPDATE songs SET score = score + 10 WHERE id = ${song_id};`;

    res.status(200).json({ success: true, message: 'Tickle sent' });
  } catch (err) {
    console.error('Send tickle error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

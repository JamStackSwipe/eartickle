// /api/boost-tickles.js

import { supabase } from '../../supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, artist_id, song_id, amount, reason } = req.body;

    if (!user_id || !song_id || !amount || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 💸 Deduct tickles from user via RPC
    const { error: spendError } = await supabase.rpc('spend_tickles', {
      user_id_input: user_id,
      song_id_input: song_id,
      reason,
      cost: amount, // must be numeric in DB
    });

    if (spendError) {
      console.error('❌ Failed spend_tickles RPC:', spendError);
      return res.status(400).json({ error: spendError.message || 'Spend failed' });
    }

    // ✅ You could add promotion logic here (e.g. boost duration)

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Unexpected boost error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}

// /api/send-tickle.js
//
// ✅ Purpose: Handles gifting 1 Tickle to an artist
// ✅ Used by: "Send Tickle" button in ReactionStatsBar.js
// 🚫 Do NOT use this file for Boost Tickles or multi-cost actions
//    Boosting requires a different path (see: BoostTickles.js or /api/spend-tickles.js)

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { song_id, emoji } = req.body;

    if (!song_id || !emoji) {
      return res.status(400).json({ error: 'Missing song ID or emoji' });
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No auth token provided' });
    }

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized or user not found' });
    }

    // ✅ Call the RPC function that handles gifting logic safely
    const { error: rpcError } = await supabase.rpc('send_gift_tickles', {
      sender_id: user.id,
      song_id,
      amount: 1
    });

    if (rpcError) {
      console.error('❌ RPC Error:', rpcError);
      return res.status(500).json({ error: 'Failed to send tickle' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ Uncaught error in /api/send-tickle:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

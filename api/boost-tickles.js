// /api/boost-tickles.js
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { supabase } from '../../supabase'; // adjust if needed

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, song_id, artist_id, amount, reason } = req.body;

    if (!user_id || !song_id || !amount || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure amount is an integer
    const cost = parseInt(amount);
    if (isNaN(cost)) {
      return res.status(400).json({ error: 'Invalid amount value' });
    }

    // Call the fixed RPC function
    const { error } = await supabase.rpc('spend_tickles', {
      user_id_input: user_id,
      song_id_input: song_id,
      reason: reason,
      cost: cost,
    });

    if (error) {
      console.error('❌ spend_tickles error:', error);
      return res.status(500).json({ error: error.message || 'Boost failed' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

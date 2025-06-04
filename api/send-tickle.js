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

    // Validate input
    if (!song_id || !emoji) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: !song_id ? 'Missing song_id' : 'Missing emoji',
      });
    }

    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({
        error: 'Invalid authentication',
        details: userError?.message,
      });
    }

    // Log input parameters for debugging
    console.log('Calling send_gift_tickles with:', { sender_id: user.id, song_id, amount: 1 });

    // Call RPC function
    const { error: rpcError } = await supabase.rpc('send_gift_tickles', {
      sender_id: user.id,
      song_id,
      amount: 1,
    });

    if (rpcError) {
      console.error('RPC Error Details:', {
        message: rpcError.message,
        code: rpcError.code,
        details: rpcError.details,
      });
      return res.status(500).json({
        error: 'Tickle transfer failed',
        details: rpcError.message,
      });
    }

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

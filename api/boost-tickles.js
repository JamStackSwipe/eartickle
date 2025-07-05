// /api/boost-tickles.js — Handles Boost Tickles independently of Send Tickle

const { createClient } = require('@supabase/supabase-js');

// Use REACT_APP_* for CRA environment variables
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,  // Updated to REACT_APP_SUPABASE_URL
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    console.error('❌ Invalid method');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (!body) {
      let data = '';
      for await (const chunk of req) data += chunk;
      body = JSON.parse(data);
    }

    const { user_id, artist_id, song_id, amount, reason } = body;
    console.log('⚡ Boost Tickles Request:', body);

    const { error } = await supabase.rpc('spend_tickles', {
      user_id_input: user_id,
      song_id_input: song_id,
      reason,
      cost: amount
    });

    if (error) {
      console.error('❌ Failed spend_tickles RPC:', error);
      return res.status(500).json({ error: 'Tickle spend failed' });
    }

    // Optionally insert into tickles manually if RPC doesn't handle it
    // await supabase.from('tickles').insert({ user_id, artist_id, song_id, amount, emoji: reason });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Uncaught error in boost-tickles:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

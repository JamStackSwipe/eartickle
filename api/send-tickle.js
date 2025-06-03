// /api/spend-tickles.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    console.error('❌ Invalid method for spend-tickles');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (!body) {
      let data = '';
      for await (const chunk of req) {
        data += chunk;
      }
      body = JSON.parse(data);
    }

    const { user_id_input, song_id_input, reason, cost } = body;
    console.log('🚀 Boost Payload:', body);

    const { error } = await supabase.rpc('spend_tickles', {
      user_id_input,
      song_id_input,
      reason,
      cost
    });

    if (error) {
      console.error('❌ RPC error during boost:', error);
      return res.status(500).json({ error: 'Failed to spend Tickles' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ Uncaught error in spend-tickles:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

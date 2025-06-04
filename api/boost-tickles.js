// dont let chat change this. it always wants to do somce crazy crap
// api/boost-tickles.js

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { user_id, song_id, amount, reason } = req.body;

  try {
    const { error } = await supabase.rpc('spend_tickles', {
      user_id_input: user_id,
      song_id_input: song_id,
      reason,
      cost: amount,
    });

    if (error) {
      console.error('❌ RPC Error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Server Error:', err);
    return res.status(500).json({ error: 'Server error occurred' });
  }
};

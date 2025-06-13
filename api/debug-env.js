export default function handler(req, res) {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

  res.status(200).json({
    supabaseUrl: supabaseUrl || 'undefined',
    supabaseKey: supabaseKey ? 'Set (hidden for security)' : 'undefined',
    timestamp: new Date().toISOString() // To confirm fresh response
  });
}

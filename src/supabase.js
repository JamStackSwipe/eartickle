import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Log variables for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey);

if (!supabaseUrl) {
  console.error('Supabase URL is missing. Ensure REACT_APP_SUPABASE_URL is set in Vercel environment variables.');
  throw new Error('Supabase URL is required');
}
if (!supabaseKey) {
  console.error('Supabase Key is missing. Ensure REACT_APP_SUPABASE_KEY is set in Vercel environment variables.');
  throw new Error('Supabase Key is required');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      'Accept': 'application/json', // Fixes potential 406 error
    },
  },
});

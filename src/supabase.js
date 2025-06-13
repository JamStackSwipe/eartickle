import { createClient } from '@supabase/supabase-js';

// Debug build - June 12 2025 2045
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Set (hidden)' : 'undefined');

if (!supabaseUrl) throw new Error('Supabase URL is required');
if (!supabaseKey) throw new Error('Supabase Key is required');

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      'Accept': 'application/json',
    },
  },
});

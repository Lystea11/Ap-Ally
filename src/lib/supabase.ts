import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and service key are required. Check your .env file.');
}

// Create a single supabase client for use in backend operations
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // We are using Firebase for auth, so we disable Supabase's auto-refreshing of tokens.
    autoRefreshToken: false,
    persistSession: false,
  },
});

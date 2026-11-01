import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  Boolean(rawUrl) &&
  rawUrl !== 'https://your-project.supabase.co' &&
  Boolean(rawAnonKey) &&
  rawAnonKey !== 'your-supabase-anon-key';

if (!isConfigured && import.meta.env.PROD) {
  console.warn(
    'Invalid or missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Please update your environment variables.',
  );
}

const supabaseUrl = isConfigured ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = isConfigured
  ? rawAnonKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type { User } from '@supabase/supabase-js';

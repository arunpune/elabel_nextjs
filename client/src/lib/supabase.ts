import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://owhgsymmyfaejfdpwqzz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_FQ99p-TBo-YMj6AfAj8Nfw_UlymnewV';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  Boolean(rawUrl) &&
  rawUrl !== 'https://your-project.supabase.co' &&
  rawUrl !== 'https://placeholder.supabase.co' &&
  Boolean(rawAnonKey) &&
  rawAnonKey !== 'your-supabase-anon-key';

const supabaseUrl = isConfigured ? rawUrl : DEFAULT_SUPABASE_URL;
const supabaseAnonKey = isConfigured ? rawAnonKey : DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type { User } from '@supabase/supabase-js';

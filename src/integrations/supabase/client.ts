import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const buildTimeFallbackSupabaseUrl = 'https://placeholder.supabase.co';
const buildTimeFallbackSupabaseAnonKey = 'placeholder-anon-key';

const resolvedSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const resolvedSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const hasSupabaseEnv = Boolean(resolvedSupabaseUrl && resolvedSupabaseAnonKey);

if (!hasSupabaseEnv) {
  console.warn(
    'Missing Supabase environment variables. Using placeholder values so the app can compile during build-time prerender.',
  );
}

const supabaseUrl = resolvedSupabaseUrl ?? buildTimeFallbackSupabaseUrl;
const supabaseAnonKey = resolvedSupabaseAnonKey ?? buildTimeFallbackSupabaseAnonKey;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

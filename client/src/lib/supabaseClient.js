import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const createFallbackClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: async () => ({ data: null, error: new Error('Supabase is not configured.') }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase is not configured.') }),
    signInWithOAuth: async () => ({ data: null, error: new Error('Supabase is not configured.') }),
    signOut: async () => ({ error: new Error('Supabase is not configured.') }),
  },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackClient();

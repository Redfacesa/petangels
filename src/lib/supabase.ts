import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon && anon !== 'your_anon_key');

export const supabase = supabaseConfigured ? createClient(url, anon) : null;

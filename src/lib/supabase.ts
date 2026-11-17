import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Verifica si las variables de entorno de Supabase están configuradas adecuadamente.
 */
export function isSupabaseConfigured(): boolean {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('tu-proyecto') &&
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('https://')
  );
}

// Fallback seguro en caso de que aún no se hayan configurado las variables en .env.local
const effectiveUrl = isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co';
const effectiveKey = isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-key';

export const supabase = createClient(effectiveUrl, effectiveKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

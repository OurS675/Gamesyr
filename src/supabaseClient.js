import { createClient } from '@supabase/supabase-js';

// Obtener las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Verificar si las variables están definidas
console.log('Supabase URL:', supabaseUrl ? 'Configurada' : 'NO CONFIGURADA');
console.log('Supabase Key:', supabaseKey ? 'Configurada' : 'NO CONFIGURADA');

// Usar valores predeterminados si las variables no están definidas
// Esto es solo para desarrollo, en producción siempre deberían estar configuradas
const finalSupabaseUrl = supabaseUrl || 'https://ynscfbygohioarcomlyw.supabase.co';
const finalSupabaseKey = supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inluc2NmYnlnb2hpb2FyY29tbHl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2ODc4NzgsImV4cCI6MjA3NTI2Mzg3OH0.29JxYKMTMDf3tu304jTL2n4_vwc2Vej9cgoQ1ajROnw';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Usando valores predeterminados para Supabase. Para un entorno de producción, configura las variables de entorno:');
  console.warn('VITE_SUPABASE_URL=tu_url_aqui');
  console.warn('VITE_SUPABASE_KEY=tu_key_aqui');
}

// Crear el cliente de Supabase con los valores finales
export const supabase = createClient(finalSupabaseUrl, finalSupabaseKey, {
  auth: {
    // Persistir la sesión en localStorage del navegador (por defecto suele estar activado,
    // lo hacemos explícito para evitar comportamientos inesperados)
    persistSession: true,
    // Evitar que Supabase intente detectar tokens en la URL (útil si usas OAuth)
    detectSessionInUrl: false,
    // Permitir refresh automático del token
    autoRefreshToken: true,
    // Usar el storage del navegador explícitamente
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});
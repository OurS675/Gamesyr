import { createClient } from '@supabase/supabase-js';
import logger from './utils/logger';

// Obtener las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Verificar si las variables están definidas
logger.debug('Supabase URL:', supabaseUrl ? 'Configurada' : 'NO CONFIGURADA');
logger.debug('Supabase Key:', supabaseKey ? 'Configurada' : 'NO CONFIGURADA');

// Usar valores predeterminados si las variables no están definidas
// Esto es solo para desarrollo, en producción siempre deberían estar configuradas
const finalSupabaseUrl = supabaseUrl || 'https://ynscfbygohioarcomlyw.supabase.co';
// IMPORTANT: Do NOT hardcode keys in the repository. Use environment variables.
const finalSupabaseKey = supabaseKey || '';

if (!supabaseUrl || !supabaseKey) {
  logger.warn('⚠️ Variables de entorno de Supabase no configuradas. En producción coloca estas variables en tu entorno de despliegue, no en el repo:');
  logger.warn('VITE_SUPABASE_URL=tu_url_aqui');
  logger.warn('VITE_SUPABASE_KEY=tu_key_aqui');
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
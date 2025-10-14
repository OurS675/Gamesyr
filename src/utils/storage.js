import { supabase } from '../supabaseClient';

// Nombre del bucket que usaremos en el proyecto (public)
// Actualizado para usar el bucket proporcionado por el usuario: 'avatars'
export const BUCKET = 'avatars';

// Sube un archivo al bucket en la ruta indicada
export async function uploadFile(path, file, options = {}) {
  try {
    const safePath = sanitizePath(path);
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(safePath, file, { cacheControl: '3600', upsert: false, ...options });

    return { data, error, path: safePath };
  } catch (error) {
    return { data: null, error };
  }
}

// Sanitiza cada segmento de una ruta (quita acentos, espacios y caracteres no permitidos)
function sanitizeFileName(name) {
  if (!name) return name;
  // Normalizar y eliminar diacríticos
  const normalized = name.normalize('NFKD').replace(/\p{Diacritic}/gu, '');
  // Reemplazar espacios por guión bajo y eliminar caracteres no seguros
  return normalized
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .slice(0, 240); // limitar longitud
}

function sanitizePath(path) {
  if (!path) return path;
  // Mantener separador / y sanitizar cada segmento
  return path.split('/').map(part => sanitizeFileName(part)).join('/');
}

// Devuelve la URL pública (útil si el bucket es público)
export function getPublicUrl(path) {
  try {
    const res = supabase.storage.from(BUCKET).getPublicUrl(path);
    return res?.data?.publicUrl || null;
  } catch (error) {
    console.error('getPublicUrl error', error);
    return null;
  }
}

// Descargar archivo (devuelve Blob si es privado o petición directa si público)
export async function downloadFile(path) {
  try {
    const { data, error } = await supabase.storage.from(BUCKET).download(path);
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Crear signed url (requiere service_role si lo usas desde servidor)
export async function createSignedUrl(path, expires = 60) {
  try {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expires);
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

import { STORAGE_BUCKET } from './config';
import { supabase } from './supabase';

export function publicMediaUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  if (!supabase) return pathOrUrl;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(pathOrUrl);
  return data.publicUrl;
}

export async function uploadPetImage(userId: string, file: File) {
  if (!supabase) throw new Error('Storage is not configured');
  const safe = file.name.replace(/[^\w.-]+/g, '-').slice(0, 80);
  const path = `${userId}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return publicMediaUrl(path);
}

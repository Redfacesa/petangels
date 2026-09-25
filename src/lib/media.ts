import { STORAGE_BUCKET } from './config';
import { supabase } from './supabase';

export function publicMediaUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  if (!supabase) return pathOrUrl;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(pathOrUrl);
  return data.publicUrl;
}

function extFromFile(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName.replace(/[^\w]/g, '') || 'jpg';
  const mime = (file.type || '').toLowerCase();
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('heic') || mime.includes('heif')) return 'heic';
  return 'jpg';
}

export async function uploadPetImage(userId: string, file: File) {
  if (!supabase) throw new Error('Storage is not configured');
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user.id || userId;
  if (!sessionData.session) throw new Error('Sign in again, then upload the photo.');
  const path = `${uid}/${Date.now()}.${extFromFile(file)}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || 'image/jpeg',
  });
  if (error) throw new Error(error.message || 'Photo upload was blocked (403). Paste the petimages upload SQL.');
  return publicMediaUrl(path);
}

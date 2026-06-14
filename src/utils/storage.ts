import { uploadData, getUrl } from 'aws-amplify/storage';

export async function uploadFile(file: File, folder = 'uploads'): Promise<string> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `public/${folder}/${Date.now()}-${safe}`;
  await uploadData({ path, data: file, options: { contentType: file.type } }).result;
  return path;
}

export async function resolveUrl(path: string): Promise<string> {
  const { url } = await getUrl({ path, options: { expiresIn: 3600 } });
  return url.toString();
}

import { put } from '@vercel/blob';

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File | null;
  const slug = formData.get('sku') + '-' + formData.get('name');

  if (!file) {
    throw new Error('No file provided');
  }

  const blob = await put(`products/${slug}-${file.name}`, file, {
    access: 'public',
  });

  return blob.url; // Return the public URL
}

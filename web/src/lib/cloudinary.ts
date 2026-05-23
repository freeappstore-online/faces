const CLOUD_NAME = 'lkzycqsuf'
const UPLOAD_PRESET = 'cttcla3s'
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload/`

export function faceThumbUrl(publicId: string, size = 300): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${size},h_${size},c_fill,g_face/${publicId}`
}

export function faceFullUrl(publicId: string, maxWidth = 1200): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${maxWidth},c_limit/${publicId}`
}

export async function uploadImage(file: File): Promise<{ publicId: string; url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'faces')

  const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  const data = await res.json() as { public_id: string; secure_url: string }
  return { publicId: data.public_id, url: data.secure_url }
}

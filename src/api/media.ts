import { apiRequest, apiUpload, unwrapData } from '../lib/api'
import { prepareMediaFile } from '../lib/prepareMediaFile'

export type MediaAsset = {
  publicId: string
  url: string
  filename: string
  alt: string
  mimeType: string
  sizeBytes: number | null
  uploadedAt: string | null
}

export type MediaUploadResult = {
  url: string
  publicId: string
  resourceType: string
  format: string
  width: number
  height: number
  bytes: number
}

function normalizeAsset(item: unknown): MediaAsset | null {
  if (!item || typeof item !== 'object') return null

  const record = item as Record<string, unknown>
  const publicId = typeof record.publicId === 'string' ? record.publicId : ''
  const url = typeof record.url === 'string' ? record.url : ''

  if (!publicId || !url) return null

  return {
    publicId,
    url,
    filename: typeof record.filename === 'string' ? record.filename : publicId,
    alt: typeof record.alt === 'string' ? record.alt : '',
    mimeType: typeof record.mimeType === 'string' ? record.mimeType : 'image/jpeg',
    sizeBytes: typeof record.sizeBytes === 'number' ? record.sizeBytes : null,
    uploadedAt: typeof record.uploadedAt === 'string' ? record.uploadedAt : null,
  }
}

function toMediaAsset(upload: MediaUploadResult, file: File, alt: string): MediaAsset {
  const format = upload.format || 'jpeg'
  return {
    publicId: upload.publicId,
    url: upload.url,
    filename: file.name || `${upload.publicId.split('/').pop()}.${format}`,
    alt: alt.trim() || file.name.replace(/\.[^.]+$/, ''),
    mimeType: file.type || `image/${format}`,
    sizeBytes: upload.bytes ?? null,
    uploadedAt: new Date().toISOString(),
  }
}

/** Shared library from GET /v1/media — the same list on every device. */
export async function fetchMediaAssets(): Promise<MediaAsset[]> {
  const payload = await apiRequest<unknown>('/v1/media')
  const data = unwrapData<unknown>(payload)
  if (!Array.isArray(data)) return []

  return data
    .map((item) => normalizeAsset(item))
    .filter((asset): asset is MediaAsset => asset !== null)
}

/** Upload via POST /v1/media/upload. The API stores the asset in the shared library. */
export async function uploadMediaImage(file: File, alt = ''): Promise<MediaAsset> {
  const prepared = await prepareMediaFile(file)
  const formData = new FormData()
  formData.append('file', prepared.file)
  formData.append('alt', alt.trim())

  const payload = await apiUpload<unknown>('/v1/media/upload', formData)
  const upload = unwrapData<MediaUploadResult>(payload)
  return toMediaAsset(upload, prepared.file, alt)
}

/** Delete via DELETE /v1/media. The API removes it from Cloudinary and the shared library. */
export async function deleteMediaImage(publicId: string): Promise<void> {
  const payload = await apiRequest<unknown>('/v1/media', {
    method: 'DELETE',
    body: { publicId },
  })
  unwrapData(payload)
}

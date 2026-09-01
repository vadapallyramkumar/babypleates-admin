import { apiRequest, apiUpload, unwrapData } from '../lib/api'

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

const LOCAL_MEDIA_KEY = 'babypleats-media-assets'

function readLocalAssets(): MediaAsset[] {
  try {
    const raw = localStorage.getItem(LOCAL_MEDIA_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => normalizeStoredAsset(item))
      .filter((asset): asset is MediaAsset => asset !== null)
  } catch {
    return []
  }
}

function writeLocalAssets(assets: MediaAsset[]) {
  localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(assets))
}

/** Support older localStorage entries that used `id` instead of `publicId`. */
function normalizeStoredAsset(item: unknown): MediaAsset | null {
  if (!item || typeof item !== 'object') return null

  const record = item as Record<string, unknown>
  const publicId =
    typeof record.publicId === 'string'
      ? record.publicId
      : typeof record.id === 'string'
        ? record.id
        : ''
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

function toMediaAsset(
  upload: MediaUploadResult,
  file: File,
  alt: string,
): MediaAsset {
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

/**
 * Media library is stored locally — the API has upload/delete only (no list endpoint).
 */
export async function fetchMediaAssets(): Promise<MediaAsset[]> {
  return readLocalAssets()
}

/** Upload image via POST /v1/media/upload and save to the local library. */
export async function uploadMediaImage(file: File, alt = ''): Promise<MediaAsset> {
  const formData = new FormData()
  formData.append('file', file)

  const payload = await apiUpload<unknown>('/v1/media/upload', formData)
  const upload = unwrapData<MediaUploadResult>(payload)

  const asset = toMediaAsset(upload, file, alt)
  const next = [asset, ...readLocalAssets().filter((a) => a.publicId !== asset.publicId)]
  writeLocalAssets(next)
  return asset
}

/** Delete image via DELETE /v1/media and remove from the local library. */
export async function deleteMediaImage(publicId: string): Promise<void> {
  const payload = await apiRequest<unknown>('/v1/media', {
    method: 'DELETE',
    body: { publicId },
  })
  unwrapData(payload)

  writeLocalAssets(readLocalAssets().filter((a) => a.publicId !== publicId))
}

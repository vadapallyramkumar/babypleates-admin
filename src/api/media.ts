import { apiRequest, apiUpload, unwrapData } from '../lib/api'
import { prepareMediaFile } from '../lib/prepareMediaFile'

export type MediaResourceType = 'image' | 'video'

export type MediaAsset = {
  publicId: string
  url: string
  filename: string
  alt: string
  mimeType: string
  resourceType: MediaResourceType
  sizeBytes: number | null
  uploadedAt: string | null
}

export type MediaUploadResult = {
  url: string
  publicId: string
  resourceType: string
  format: string
  filename?: string
  width: number
  height: number
  bytes: number
}

function resourceTypeFromMime(mimeType: string): MediaResourceType {
  return mimeType.startsWith('video/') ? 'video' : 'image'
}

function normalizeResourceType(
  value: unknown,
  mimeType: string,
): MediaResourceType {
  if (value === 'image' || value === 'video') return value
  return resourceTypeFromMime(mimeType)
}

function normalizeAsset(item: unknown): MediaAsset | null {
  if (!item || typeof item !== 'object') return null

  const record = item as Record<string, unknown>
  const publicId = typeof record.publicId === 'string' ? record.publicId : ''
  const url = typeof record.url === 'string' ? record.url : ''

  if (!publicId || !url) return null

  const mimeType =
    typeof record.mimeType === 'string' ? record.mimeType : 'image/jpeg'

  return {
    publicId,
    url,
    filename: typeof record.filename === 'string' ? record.filename : publicId,
    alt: typeof record.alt === 'string' ? record.alt : '',
    mimeType,
    resourceType: normalizeResourceType(record.resourceType, mimeType),
    sizeBytes: typeof record.sizeBytes === 'number' ? record.sizeBytes : null,
    uploadedAt: typeof record.uploadedAt === 'string' ? record.uploadedAt : null,
  }
}

function mimeFromUpload(upload: MediaUploadResult, file?: File): string {
  if (file?.type) return file.type
  const format = (upload.format || '').toLowerCase()
  if (upload.resourceType === 'video') {
    if (format === 'webm') return 'video/webm'
    if (format === 'mov') return 'video/quicktime'
    return 'video/mp4'
  }
  if (format === 'png') return 'image/png'
  if (format === 'webp') return 'image/webp'
  if (format === 'gif') return 'image/gif'
  return 'image/jpeg'
}

function toMediaAsset(upload: MediaUploadResult, alt: string, file?: File): MediaAsset {
  const format = upload.format || 'jpeg'
  const filename =
    upload.filename ||
    file?.name ||
    `${upload.publicId.split('/').pop()}.${format}`
  const mimeType = mimeFromUpload(upload, file)
  return {
    publicId: upload.publicId,
    url: upload.url,
    filename,
    alt: alt.trim() || filename.replace(/\.[^.]+$/, ''),
    mimeType,
    resourceType: normalizeResourceType(upload.resourceType, mimeType),
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

export type MediaBatchFailure = {
  filename: string
  message: string
}

export type MediaBatchResult = {
  uploaded: MediaAsset[]
  failed: MediaBatchFailure[]
}

function normalizeBatchFailure(item: unknown): MediaBatchFailure | null {
  if (!item || typeof item !== 'object') return null
  const record = item as Record<string, unknown>
  const filename = typeof record.filename === 'string' ? record.filename : ''
  const message = typeof record.message === 'string' ? record.message : ''
  if (!filename && !message) return null
  return {
    filename: filename || 'file',
    message: message || 'Upload failed.',
  }
}

/** Upload via POST /v1/media/upload. The API stores the asset in the shared library. */
export async function uploadMediaImage(file: File, alt = ''): Promise<MediaAsset> {
  const prepared = await prepareMediaFile(file)
  const formData = new FormData()
  formData.append('file', prepared.file)
  formData.append('alt', alt.trim())

  const payload = await apiUpload<unknown>('/v1/media/upload', formData)
  const upload = unwrapData<MediaUploadResult>(payload)
  return toMediaAsset(upload, alt, prepared.file)
}

/**
 * Upload many files via POST /v1/media/upload-batch.
 * Returns successful assets plus any per-file failures from the API.
 */
export async function uploadMediaBatch(files: File[], alt = ''): Promise<MediaBatchResult> {
  if (files.length === 0) {
    throw new Error('Choose at least one image or video to upload.')
  }

  const preparedFiles: File[] = []
  for (const file of files) {
    const prepared = await prepareMediaFile(file)
    preparedFiles.push(prepared.file)
  }

  const formData = new FormData()
  for (const file of preparedFiles) {
    formData.append('files', file)
  }
  formData.append('alt', alt.trim())

  const payload = await apiUpload<unknown>('/v1/media/upload-batch', formData)
  const data = unwrapData<unknown>(payload)

  if (!data || typeof data !== 'object') {
    throw new Error('Unexpected upload response.')
  }

  const record = data as Record<string, unknown>
  const uploadedRaw = Array.isArray(record.uploaded) ? record.uploaded : []
  const failedRaw = Array.isArray(record.failed) ? record.failed : []

  const uploaded = uploadedRaw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const upload = item as MediaUploadResult
      if (!upload.publicId || !upload.url) return null
      const source = preparedFiles.find((file) => file.name === upload.filename)
      return toMediaAsset(upload, alt, source)
    })
    .filter((asset): asset is MediaAsset => asset !== null)

  const failed = failedRaw
    .map((item) => normalizeBatchFailure(item))
    .filter((item): item is MediaBatchFailure => item !== null)

  return { uploaded, failed }
}

/** Delete via DELETE /v1/media. The API removes it from Cloudinary and the shared library. */
export async function deleteMediaImage(
  publicId: string,
  resourceType: MediaResourceType,
): Promise<void> {
  const payload = await apiRequest<unknown>('/v1/media', {
    method: 'DELETE',
    body: { publicId, resourceType },
  })
  unwrapData(payload)
}

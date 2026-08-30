export type MediaAsset = {
  id: string
  url: string
  filename: string
  alt: string
  mimeType: string
  sizeBytes: number | null
  uploadedAt: string | null
}

export type CreateMediaPayload = {
  url: string
  filename: string
  alt: string
  mimeType: string
}

/** Dummy library until GET /media is wired. */
const DUMMY_MEDIA: MediaAsset[] = [
  {
    id: 'media-001',
    filename: 'pink-floral-dress.jpg',
    url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1',
    alt: 'Pink floral dress for baby girl',
    mimeType: 'image/jpeg',
    sizeBytes: 245760,
    uploadedAt: '2026-08-30T08:15:00Z',
  },
  {
    id: 'media-002',
    filename: 'baby-party-frock.jpg',
    url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7',
    alt: 'Baby party frock',
    mimeType: 'image/jpeg',
    sizeBytes: 318450,
    uploadedAt: '2026-08-29T16:42:00Z',
  },
  {
    id: 'media-003',
    filename: 'kids-fashion-collection.jpg',
    url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4',
    alt: 'Kids fashion collection',
    mimeType: 'image/jpeg',
    sizeBytes: 426780,
    uploadedAt: '2026-08-28T11:25:00Z',
  },
  {
    id: 'media-004',
    filename: 'white-baby-dress.jpg',
    url: 'https://images.unsplash.com/photo-1522771930-78848d9293e8',
    alt: 'White baby dress',
    mimeType: 'image/jpeg',
    sizeBytes: 189340,
    uploadedAt: '2026-08-27T09:18:00Z',
  },
  {
    id: 'media-005',
    filename: 'birthday-dress.jpg',
    url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c',
    alt: 'Birthday dress for baby',
    mimeType: 'image/jpeg',
    sizeBytes: 523890,
    uploadedAt: '2026-08-25T14:36:00Z',
  },
  {
    id: 'media-006',
    filename: 'baby-fashion-banner.jpg',
    url: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01',
    alt: 'Baby fashion banner',
    mimeType: 'image/jpeg',
    sizeBytes: 674320,
    uploadedAt: '2026-08-23T10:52:00Z',
  },
  {
    id: 'media-007',
    filename: 'floral-kids-wear.jpg',
    url: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42',
    alt: 'Floral kids wear',
    mimeType: 'image/jpeg',
    sizeBytes: 356780,
    uploadedAt: '2026-08-21T17:08:00Z',
  },
  {
    id: 'media-008',
    filename: 'summer-baby-collection.jpg',
    url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74',
    alt: 'Summer baby collection',
    mimeType: 'image/jpeg',
    sizeBytes: 287450,
    uploadedAt: '2026-08-18T12:24:00Z',
  },
  {
    id: 'media-009',
    filename: 'kids-dress-pink.jpg',
    url: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8',
    alt: 'Pink kids dress',
    mimeType: 'image/jpeg',
    sizeBytes: 412560,
    uploadedAt: '2026-08-15T15:45:00Z',
  },
  {
    id: 'media-011',
    filename: 'kids-party-wear.jpg',
    url: 'https://images.unsplash.com/photo-1602030028438-4cf153cbae9e',
    alt: 'Kids party wear',
    mimeType: 'image/jpeg',
    sizeBytes: 378920,
    uploadedAt: '2026-08-08T18:12:00Z',
  },
  {
    id: 'media-012',
    filename: 'baby-fashion-product.jpg',
    url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9',
    alt: 'Baby fashion product',
    mimeType: 'image/jpeg',
    sizeBytes: 465780,
    uploadedAt: '2026-08-04T13:28:00Z',
  },
]

/**
 * Fetch media library assets.
 * Uses dummy data for now — swap for GET /media when ready.
 */
export async function fetchMediaAssets(): Promise<MediaAsset[]> {
  return DUMMY_MEDIA
}

/**
 * Create / register a media asset.
 * Stub until the upload API is available — adjust fields when you share the payload.
 */
export async function createMediaAsset(
  payload: CreateMediaPayload,
): Promise<CreateMediaPayload> {
  // TODO: replace with POST /media (multipart or JSON)
  console.info('Create media payload', payload)
  return payload
}

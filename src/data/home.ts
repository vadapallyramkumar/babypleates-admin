export type SocialMediaType = 'image' | 'video'

export const SOCIAL_MEDIA_TYPES: SocialMediaType[] = ['image', 'video']

export function socialMediaTypeLabel(type: SocialMediaType): string {
  return type === 'video' ? 'Video' : 'Image'
}

export type HeroImage = {
  id: string
  url: string
  mobileUrl: string | null
  alt: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type PromotionalMessage = {
  id: string
  message: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

/** Homepage trending media item (`/v1/home/social-links`). */
export type SocialLink = {
  id: string
  url: string
  type: SocialMediaType
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

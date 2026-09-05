import { apiRequest, unwrapData } from '../lib/api'
import type {
  HeroImage,
  PromotionalMessage,
  SocialLink,
  SocialMediaType,
} from '../data/home'

export type HeroImagePayload = {
  url: string
  mobileUrl?: string | null
  alt: string
  order?: number
  active?: boolean
}

export type PromotionalMessagePayload = {
  message: string
  order?: number
  active?: boolean
}

export type SocialLinkPayload = {
  url: string
  type: SocialMediaType
  order?: number
  active?: boolean
}

function includeInactiveQuery(includeInactive?: boolean): string {
  if (!includeInactive) return ''
  return '?includeInactive=true'
}

// --- Hero images ---

export async function fetchHeroImages(options?: {
  includeInactive?: boolean
}): Promise<HeroImage[]> {
  const path = `/v1/home/hero-images${includeInactiveQuery(options?.includeInactive)}`
  const payload = await apiRequest<unknown>(path)
  const data = unwrapData<HeroImage[]>(payload)
  return [...data].sort((a, b) => a.order - b.order)
}

export async function fetchHeroImage(id: string): Promise<HeroImage> {
  const payload = await apiRequest<unknown>(
    `/v1/home/hero-images/${encodeURIComponent(id)}`,
  )
  return unwrapData<HeroImage>(payload)
}

export async function createHeroImage(body: HeroImagePayload): Promise<HeroImage> {
  const payload = await apiRequest<unknown>('/v1/home/hero-images', {
    method: 'POST',
    body,
  })
  return unwrapData<HeroImage>(payload)
}

export async function updateHeroImage(
  id: string,
  body: Partial<HeroImagePayload>,
): Promise<HeroImage> {
  const payload = await apiRequest<unknown>(
    `/v1/home/hero-images/${encodeURIComponent(id)}`,
    { method: 'PATCH', body },
  )
  return unwrapData<HeroImage>(payload)
}

export async function deleteHeroImage(id: string): Promise<void> {
  await apiRequest(`/v1/home/hero-images/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

// --- Promotional messages ---

export async function fetchPromotionalMessages(options?: {
  includeInactive?: boolean
}): Promise<PromotionalMessage[]> {
  const path = `/v1/home/promotional-messages${includeInactiveQuery(options?.includeInactive)}`
  const payload = await apiRequest<unknown>(path)
  const data = unwrapData<PromotionalMessage[]>(payload)
  return [...data].sort((a, b) => a.order - b.order)
}

export async function fetchPromotionalMessage(id: string): Promise<PromotionalMessage> {
  const payload = await apiRequest<unknown>(
    `/v1/home/promotional-messages/${encodeURIComponent(id)}`,
  )
  return unwrapData<PromotionalMessage>(payload)
}

export async function createPromotionalMessage(
  body: PromotionalMessagePayload,
): Promise<PromotionalMessage> {
  const payload = await apiRequest<unknown>('/v1/home/promotional-messages', {
    method: 'POST',
    body,
  })
  return unwrapData<PromotionalMessage>(payload)
}

export async function updatePromotionalMessage(
  id: string,
  body: Partial<PromotionalMessagePayload>,
): Promise<PromotionalMessage> {
  const payload = await apiRequest<unknown>(
    `/v1/home/promotional-messages/${encodeURIComponent(id)}`,
    { method: 'PATCH', body },
  )
  return unwrapData<PromotionalMessage>(payload)
}

export async function deletePromotionalMessage(id: string): Promise<void> {
  await apiRequest(`/v1/home/promotional-messages/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

// --- Social links ---

export async function fetchSocialLinks(options?: {
  includeInactive?: boolean
}): Promise<SocialLink[]> {
  const path = `/v1/home/social-links${includeInactiveQuery(options?.includeInactive)}`
  const payload = await apiRequest<unknown>(path)
  const data = unwrapData<SocialLink[]>(payload)
  return [...data].sort((a, b) => a.order - b.order)
}

export async function fetchSocialLink(id: string): Promise<SocialLink> {
  const payload = await apiRequest<unknown>(
    `/v1/home/social-links/${encodeURIComponent(id)}`,
  )
  return unwrapData<SocialLink>(payload)
}

export async function createSocialLink(body: SocialLinkPayload): Promise<SocialLink> {
  const payload = await apiRequest<unknown>('/v1/home/social-links', {
    method: 'POST',
    body,
  })
  return unwrapData<SocialLink>(payload)
}

export async function updateSocialLink(
  id: string,
  body: Partial<SocialLinkPayload>,
): Promise<SocialLink> {
  const payload = await apiRequest<unknown>(
    `/v1/home/social-links/${encodeURIComponent(id)}`,
    { method: 'PATCH', body },
  )
  return unwrapData<SocialLink>(payload)
}

export async function deleteSocialLink(id: string): Promise<void> {
  await apiRequest(`/v1/home/social-links/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

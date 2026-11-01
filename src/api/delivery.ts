import { ApiError, apiRequest, unwrapData } from '../lib/api'

/** JS weekday: 0 = Sunday … 6 = Saturday. Default working set is Mon–Sat. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type DeliverySettings = {
  minPreparationDays: number
  maxPreparationDays: number
  minCourierTransitDays: number
  maxCourierTransitDays: number
  /** Daily order cutoff as `HH:mm` in the configured timezone (e.g. `"14:00"`). */
  dailyOrderCutoff: string
  timezone: string
  workingDays: Weekday[]
  deliveryEstimatesEnabled: boolean
  updatedAt?: string
}

export type DeliverySettingsPatch = Partial<DeliverySettings>

export type DeliveryRegion = {
  id: string
  name: string
  /** Numeric PIN prefixes. Empty when `isDefault` is true (fallback region). */
  pinPrefixes: string[]
  minTransitDays: number
  maxTransitDays: number
  isActive: boolean
  /** When true, this region is the fallback for unmatched PIN codes. */
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type DeliveryRegionWritePayload = {
  name: string
  pinPrefixes: string[]
  minTransitDays: number
  maxTransitDays: number
  isActive: boolean
  isDefault?: boolean
}

export type DeliveryHoliday = {
  id: string
  /** Calendar date as `YYYY-MM-DD`. */
  date: string
  name: string
  createdAt: string
  updatedAt: string
}

export type DeliveryHolidayWritePayload = {
  date: string
  name: string
}

type ApiDeliverySettings = {
  preparationMinDays: number
  preparationMaxDays: number
  defaultTransitMinDays: number
  defaultTransitMaxDays: number
  cutoffTime: string
  timezone: string
  workingDays: number[]
  enabled: boolean
  updatedAt?: string
}

type ApiDeliveryRegion = {
  id: string
  name: string
  pincodePrefixes: string[]
  transitMinDays: number
  transitMaxDays: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  minPreparationDays: 2,
  maxPreparationDays: 3,
  minCourierTransitDays: 3,
  maxCourierTransitDays: 6,
  dailyOrderCutoff: '14:00',
  timezone: 'Asia/Kolkata',
  workingDays: [1, 2, 3, 4, 5, 6],
  deliveryEstimatesEnabled: true,
}

export const WEEKDAY_LABELS: { value: Weekday; label: string; short: string }[] = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
  { value: 0, label: 'Sunday', short: 'Sun' },
]

function normalizeSettings(raw: ApiDeliverySettings): DeliverySettings {
  const workingDays = Array.isArray(raw.workingDays)
    ? ([...new Set(raw.workingDays.filter((d) => d >= 0 && d <= 6))] as Weekday[])
    : [...DEFAULT_DELIVERY_SETTINGS.workingDays]

  return {
    minPreparationDays: Number(raw.preparationMinDays),
    maxPreparationDays: Number(raw.preparationMaxDays),
    minCourierTransitDays: Number(raw.defaultTransitMinDays),
    maxCourierTransitDays: Number(raw.defaultTransitMaxDays),
    dailyOrderCutoff: String(raw.cutoffTime || DEFAULT_DELIVERY_SETTINGS.dailyOrderCutoff),
    timezone: String(raw.timezone || DEFAULT_DELIVERY_SETTINGS.timezone),
    workingDays,
    deliveryEstimatesEnabled: Boolean(raw.enabled),
    updatedAt: raw.updatedAt,
  }
}

function toSettingsPatch(body: DeliverySettingsPatch): Record<string, unknown> {
  const patch: Record<string, unknown> = {}
  if (body.minPreparationDays !== undefined) {
    patch.preparationMinDays = body.minPreparationDays
  }
  if (body.maxPreparationDays !== undefined) {
    patch.preparationMaxDays = body.maxPreparationDays
  }
  if (body.minCourierTransitDays !== undefined) {
    patch.defaultTransitMinDays = body.minCourierTransitDays
  }
  if (body.maxCourierTransitDays !== undefined) {
    patch.defaultTransitMaxDays = body.maxCourierTransitDays
  }
  if (body.dailyOrderCutoff !== undefined) {
    patch.cutoffTime = body.dailyOrderCutoff
  }
  if (body.timezone !== undefined) {
    patch.timezone = body.timezone
  }
  if (body.workingDays !== undefined) {
    patch.workingDays = body.workingDays
  }
  if (body.deliveryEstimatesEnabled !== undefined) {
    patch.enabled = body.deliveryEstimatesEnabled
  }
  return patch
}

function normalizeRegion(raw: ApiDeliveryRegion): DeliveryRegion {
  const pinPrefixes = Array.isArray(raw.pincodePrefixes)
    ? raw.pincodePrefixes.map((p) => String(p).trim()).filter(Boolean)
    : []
  return {
    id: String(raw.id),
    name: String(raw.name),
    pinPrefixes,
    minTransitDays: Number(raw.transitMinDays),
    maxTransitDays: Number(raw.transitMaxDays),
    isActive: Boolean(raw.isActive),
    // Backend uses configured default transit when no region matches;
    // there is no persisted "default region" row.
    isDefault: false,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  }
}

function toRegionBody(body: Partial<DeliveryRegionWritePayload>): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  if (body.name !== undefined) payload.name = body.name
  if (body.pinPrefixes !== undefined) payload.pincodePrefixes = body.pinPrefixes
  if (body.minTransitDays !== undefined) payload.transitMinDays = body.minTransitDays
  if (body.maxTransitDays !== undefined) payload.transitMaxDays = body.maxTransitDays
  if (body.isActive !== undefined) payload.isActive = body.isActive
  return payload
}

function normalizeHoliday(raw: DeliveryHoliday): DeliveryHoliday {
  return {
    id: String(raw.id),
    date: String(raw.date).slice(0, 10),
    name: String(raw.name),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  }
}

export async function fetchDeliverySettings(): Promise<DeliverySettings> {
  const payload = await apiRequest<unknown>('/v1/delivery/settings')
  return normalizeSettings(unwrapData<ApiDeliverySettings>(payload))
}

export async function updateDeliverySettings(
  body: DeliverySettingsPatch,
): Promise<DeliverySettings> {
  const payload = await apiRequest<unknown>('/v1/delivery/settings', {
    method: 'PATCH',
    body: toSettingsPatch(body),
  })
  return normalizeSettings(unwrapData<ApiDeliverySettings>(payload))
}

export async function fetchDeliveryRegions(): Promise<DeliveryRegion[]> {
  const payload = await apiRequest<unknown>('/v1/delivery/regions')
  const list = unwrapData<ApiDeliveryRegion[]>(payload)
  return Array.isArray(list) ? list.map(normalizeRegion) : []
}

export async function createDeliveryRegion(
  body: DeliveryRegionWritePayload,
): Promise<DeliveryRegion> {
  if (body.isDefault) {
    throw new ApiError(
      'Default fallback delivery is configured in settings; create a PIN-prefix region instead.',
      400,
      null,
    )
  }
  const payload = await apiRequest<unknown>('/v1/delivery/regions', {
    method: 'POST',
    body: toRegionBody(body),
  })
  return normalizeRegion(unwrapData<ApiDeliveryRegion>(payload))
}

export async function updateDeliveryRegion(
  id: string,
  body: Partial<DeliveryRegionWritePayload>,
): Promise<DeliveryRegion> {
  if (body.isDefault) {
    throw new ApiError(
      'Default fallback delivery is configured in settings; update PIN prefixes instead.',
      400,
      null,
    )
  }
  const payload = await apiRequest<unknown>(
    `/v1/delivery/regions/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: toRegionBody(body) },
  )
  return normalizeRegion(unwrapData<ApiDeliveryRegion>(payload))
}

export async function deleteDeliveryRegion(id: string): Promise<void> {
  await apiRequest(`/v1/delivery/regions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function fetchDeliveryHolidays(): Promise<DeliveryHoliday[]> {
  const payload = await apiRequest<unknown>('/v1/delivery/holidays')
  const list = unwrapData<DeliveryHoliday[]>(payload)
  return Array.isArray(list) ? list.map(normalizeHoliday) : []
}

export async function createDeliveryHoliday(
  body: DeliveryHolidayWritePayload,
): Promise<DeliveryHoliday> {
  const payload = await apiRequest<unknown>('/v1/delivery/holidays', {
    method: 'POST',
    body,
  })
  return normalizeHoliday(unwrapData<DeliveryHoliday>(payload))
}

export async function updateDeliveryHoliday(
  id: string,
  body: Partial<DeliveryHolidayWritePayload>,
): Promise<DeliveryHoliday> {
  const payload = await apiRequest<unknown>(
    `/v1/delivery/holidays/${encodeURIComponent(id)}`,
    { method: 'PATCH', body },
  )
  return normalizeHoliday(unwrapData<DeliveryHoliday>(payload))
}

export async function deleteDeliveryHoliday(id: string): Promise<void> {
  await apiRequest(`/v1/delivery/holidays/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

/** Format a `YYYY-MM-DD` date as Indian display format, e.g. `15 Aug 2026`. */
export function formatHolidayDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim())
  if (!match) return isoDate
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(date.getTime())) return isoDate
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function parsePinPrefixes(raw: string): { prefixes: string[]; error: string | null } {
  const parts = raw
    .split(/[,;\s]+/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return { prefixes: [], error: null }
  }

  const prefixes: string[] = []
  const seen = new Set<string>()

  for (const part of parts) {
    if (!/^\d{1,5}$/.test(part)) {
      return {
        prefixes: [],
        error: `PIN prefix “${part}” must contain only digits (1–5 characters).`,
      }
    }
    if (seen.has(part)) {
      return {
        prefixes: [],
        error: `Duplicate PIN prefix “${part}” in this region.`,
      }
    }
    seen.add(part)
    prefixes.push(part)
  }

  return { prefixes, error: null }
}

export function isValidCutoffTime(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim())
}

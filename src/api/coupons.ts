import { apiRequest, unwrapData } from '../lib/api'

export type CouponType = 'percent' | 'fixed'

export type Coupon = {
  id: string
  code: string
  type: CouponType
  value: number
  minSubtotal: number | null
  maxDiscount: number | null
  startsAt: string | null
  endsAt: string | null
  maxRedemptions: number | null
  maxPerCustomer: number | null
  isActive: boolean
  redemptionCount: number
  createdAt: string
  updatedAt: string
}

export type CouponWritePayload = {
  code: string
  type: CouponType
  value: number
  minSubtotal?: number | null
  maxDiscount?: number | null
  startsAt?: string | null
  endsAt?: string | null
  maxRedemptions?: number | null
  maxPerCustomer?: number | null
  isActive?: boolean
}

export async function fetchCoupons(): Promise<Coupon[]> {
  const payload = await apiRequest<unknown>('/v1/coupons')
  return unwrapData<Coupon[]>(payload)
}

export async function fetchCoupon(id: string): Promise<Coupon> {
  const payload = await apiRequest<unknown>(`/v1/coupons/${encodeURIComponent(id)}`)
  return unwrapData<Coupon>(payload)
}

export async function createCoupon(body: CouponWritePayload): Promise<Coupon> {
  const payload = await apiRequest<unknown>('/v1/coupons', {
    method: 'POST',
    body,
  })
  return unwrapData<Coupon>(payload)
}

export async function updateCoupon(
  id: string,
  body: Partial<CouponWritePayload>,
): Promise<Coupon> {
  const payload = await apiRequest<unknown>(`/v1/coupons/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body,
  })
  return unwrapData<Coupon>(payload)
}

export async function deleteCoupon(id: string): Promise<void> {
  await apiRequest(`/v1/coupons/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function couponValueLabel(coupon: Coupon) {
  if (coupon.type === 'percent') return `${coupon.value}% off`
  return `₹${coupon.value.toLocaleString('en-IN')} off`
}

export function couponDateInput(iso: string | null) {
  if (!iso) return ''
  return iso.slice(0, 10)
}

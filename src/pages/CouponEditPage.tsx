import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { fetchCoupon, type Coupon } from '../api/coupons'
import { CouponForm } from '../components/coupons/CouponForm'
import { ApiError } from '../lib/api'

export function CouponEditPage() {
  const { id = '' } = useParams()
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchCoupon(id)
        if (!cancelled) setCoupon(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load coupon.')
          setMissing(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="animate-fade-up px-6 py-10 text-[0.9rem] text-muted">Loading coupon…</div>
    )
  }

  if (missing || !coupon) {
    if (error) {
      return (
        <div className="animate-fade-up px-6 py-10 text-[0.9rem] text-burgundy-soft" role="alert">
          {error}
        </div>
      )
    }
    return <Navigate to="/coupons" replace />
  }

  return <CouponForm key={coupon.id} mode="edit" initial={coupon} />
}

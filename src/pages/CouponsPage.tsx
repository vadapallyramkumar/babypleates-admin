import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  couponValueLabel,
  deleteCoupon,
  fetchCoupons,
  type Coupon,
} from '../api/coupons'
import { PageHeader } from '../components/admin/ui'
import { IconPlus, IconTrash } from '../components/icons'
import { NoticeBanner } from '../components/NoticeBanner'
import { useNotice } from '../hooks/useNotice'
import { ApiError } from '../lib/api'

function usageLabel(coupon: Coupon) {
  if (coupon.maxRedemptions == null) return `${coupon.redemptionCount} used`
  return `${coupon.redemptionCount} / ${coupon.maxRedemptions} used`
}

export function CouponsPage() {
  const { notice, showSuccess, showError, dismiss } = useNotice({
    consumeLocationState: true,
  })
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function load(opts?: { silent?: boolean }) {
    if (!opts?.silent) {
      setLoading(true)
      setError('')
    }
    try {
      setCoupons(await fetchCoupons())
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load coupons.'
      if (opts?.silent) showError(message)
      else {
        setError(message)
        setCoupons([])
      }
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleDelete(coupon: Coupon) {
    const ok = window.confirm(`Delete “${coupon.code}”?`)
    if (!ok) return
    setDeletingId(coupon.id)
    try {
      await deleteCoupon(coupon.id)
      showSuccess(`“${coupon.code}” deleted.`)
      await load({ silent: true })
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to delete coupon.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <PageHeader
        title="Coupons"
        subtitle={loading ? 'Loading…' : `${coupons.length} code${coupons.length === 1 ? '' : 's'}`}
        action={
          <Link
            to="/coupons/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark"
          >
            <IconPlus className="h-4 w-4" />
            Add coupon
          </Link>
        }
      />

      {notice ? <NoticeBanner notice={notice} onDismiss={dismiss} /> : null}

      {error ? (
        <p className="mt-4 text-[0.9rem] text-burgundy-soft" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-6 space-y-2.5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-border/40" />
          ))}
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2.5">
          {coupons.map((coupon) => (
            <li key={coupon.id} className="flex items-stretch gap-2">
              <Link
                to={`/coupons/${coupon.id}/edit`}
                className="grid min-w-0 flex-1 grid-cols-1 items-center gap-1 rounded-xl border border-border/50 bg-card px-4 py-3.5 text-[0.9rem] shadow-sm transition hover:border-burgundy/20 sm:grid-cols-[1fr_1fr_1fr_0.8fr]"
              >
                <span className="font-semibold tracking-wide text-admin-ink">{coupon.code}</span>
                <span className="text-muted">{couponValueLabel(coupon)}</span>
                <span className="text-muted">{usageLabel(coupon)}</span>
                <span className={coupon.isActive ? 'font-medium text-success' : 'text-muted'}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
              </Link>
              <button
                type="button"
                title="Delete coupon"
                aria-label={`Delete ${coupon.code}`}
                disabled={deletingId === coupon.id}
                onClick={() => void handleDelete(coupon)}
                className="inline-flex items-center justify-center rounded-xl border border-border/50 bg-card px-3 text-muted shadow-sm transition hover:bg-attention-bg hover:text-burgundy disabled:opacity-40"
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!loading && coupons.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">No coupons yet.</p>
      ) : null}
    </div>
  )
}

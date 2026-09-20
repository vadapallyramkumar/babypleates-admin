import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  couponDateInput,
  createCoupon,
  updateCoupon,
  type Coupon,
  type CouponType,
  type CouponWritePayload,
} from '../../api/coupons'
import { ApiError } from '../../lib/api'
import { homeFieldClass, homeLabelClass } from '../home/homeUi'
import { noticeLocationState } from '../NoticeBanner'

type CouponFormProps = {
  mode: 'create' | 'edit'
  initial?: Coupon
}

export function CouponForm({ mode, initial }: CouponFormProps) {
  const navigate = useNavigate()
  const isEdit = mode === 'edit'

  const [code, setCode] = useState(initial?.code ?? '')
  const [type, setType] = useState<CouponType>(initial?.type ?? 'percent')
  const [value, setValue] = useState(String(initial?.value ?? ''))
  const [minSubtotal, setMinSubtotal] = useState(
    initial?.minSubtotal != null ? String(initial.minSubtotal) : '',
  )
  const [maxDiscount, setMaxDiscount] = useState(
    initial?.maxDiscount != null ? String(initial.maxDiscount) : '',
  )
  const [startsAt, setStartsAt] = useState(couponDateInput(initial?.startsAt ?? null))
  const [endsAt, setEndsAt] = useState(couponDateInput(initial?.endsAt ?? null))
  const [maxRedemptions, setMaxRedemptions] = useState(
    initial?.maxRedemptions != null ? String(initial.maxRedemptions) : '',
  )
  const [maxPerCustomer, setMaxPerCustomer] = useState(
    String(initial?.maxPerCustomer ?? 1),
  )
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function optionalNumber(raw: string): number | null {
    const trimmed = raw.trim()
    if (!trimmed) return null
    const n = Number(trimmed)
    return Number.isFinite(n) ? n : Number.NaN
  }

  function buildPayload(): CouponWritePayload | null {
    const normalized = code.trim().toUpperCase()
    const amount = Number(value)
    const min = optionalNumber(minSubtotal)
    const cap = optionalNumber(maxDiscount)
    const maxUses = optionalNumber(maxRedemptions)
    const perCustomer = optionalNumber(maxPerCustomer)

    if (!normalized) {
      setError('Code is required.')
      return null
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Value must be greater than 0.')
      return null
    }
    if (type === 'percent' && amount > 100) {
      setError('Percent off cannot exceed 100.')
      return null
    }
    if (min !== null && Number.isNaN(min)) {
      setError('Minimum cart must be a number.')
      return null
    }
    if (cap !== null && Number.isNaN(cap)) {
      setError('Max discount must be a number.')
      return null
    }
    if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) {
      setError('Max uses must be a whole number of 1 or more.')
      return null
    }
    if (perCustomer !== null && (!Number.isInteger(perCustomer) || perCustomer < 1)) {
      setError('Max per customer must be a whole number of 1 or more, or blank for unlimited.')
      return null
    }

    setError('')
    return {
      code: normalized,
      type,
      value: amount,
      minSubtotal: min,
      maxDiscount: cap,
      startsAt: startsAt || null,
      endsAt: endsAt || null,
      maxRedemptions: maxUses,
      maxPerCustomer: perCustomer,
      isActive,
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = buildPayload()
    if (!payload) return

    setSaving(true)
    setError('')
    try {
      if (isEdit && initial) {
        await updateCoupon(initial.id, payload)
        navigate('/coupons', {
          state: noticeLocationState(`“${payload.code}” updated.`),
        })
      } else {
        await createCoupon(payload)
        navigate('/coupons', {
          state: noticeLocationState(`“${payload.code}” created.`),
        })
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save coupon.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <p className="text-[0.8rem] text-muted">
        <Link to="/coupons" className="text-sidebar-active hover:text-burgundy">
          Coupons
        </Link>
        <span className="mx-1.5">/</span>
        {isEdit ? 'Edit' : 'New'}
      </p>
      <h1 className="mt-2 font-display text-[1.85rem] font-semibold text-admin-ink">
        {isEdit ? `Edit ${initial?.code}` : 'New coupon'}
      </h1>

      {error ? (
        <p className="mt-4 text-[0.9rem] text-burgundy-soft" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 max-w-2xl space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <label className="block">
          <span className={homeLabelClass}>Code</span>
          <input
            className={`${homeFieldClass} mt-1.5 uppercase`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="FESTIVE10"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={homeLabelClass}>Type</span>
            <select
              className={`${homeFieldClass} mt-1.5`}
              value={type}
              onChange={(e) => setType(e.target.value as CouponType)}
            >
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount (₹)</option>
            </select>
          </label>
          <label className="block">
            <span className={homeLabelClass}>{type === 'percent' ? 'Percent' : 'Amount (₹)'}</span>
            <input
              className={`${homeFieldClass} mt-1.5`}
              value={value}
              inputMode="decimal"
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={homeLabelClass}>Min cart (optional)</span>
            <input
              className={`${homeFieldClass} mt-1.5`}
              value={minSubtotal}
              inputMode="decimal"
              placeholder="1999"
              onChange={(e) => setMinSubtotal(e.target.value)}
            />
          </label>
          <label className="block">
            <span className={homeLabelClass}>Max discount (optional)</span>
            <input
              className={`${homeFieldClass} mt-1.5`}
              value={maxDiscount}
              inputMode="decimal"
              placeholder="500"
              onChange={(e) => setMaxDiscount(e.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={homeLabelClass}>Starts</span>
            <input
              type="date"
              className={`${homeFieldClass} mt-1.5`}
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </label>
          <label className="block">
            <span className={homeLabelClass}>Ends</span>
            <input
              type="date"
              className={`${homeFieldClass} mt-1.5`}
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={homeLabelClass}>Max total uses</span>
            <input
              className={`${homeFieldClass} mt-1.5`}
              value={maxRedemptions}
              inputMode="numeric"
              placeholder="Unlimited"
              onChange={(e) => setMaxRedemptions(e.target.value)}
            />
          </label>
          <label className="block">
            <span className={homeLabelClass}>Max per phone</span>
            <input
              className={`${homeFieldClass} mt-1.5`}
              value={maxPerCustomer}
              inputMode="numeric"
              onChange={(e) => setMaxPerCustomer(e.target.value)}
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-[0.9rem] text-admin-ink">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEdit ? 'Save coupon' : 'Create coupon'}
        </button>
        <Link
          to="/coupons"
          className="rounded-lg px-4 py-2.5 text-[0.88rem] font-medium text-muted transition hover:text-admin-ink"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}

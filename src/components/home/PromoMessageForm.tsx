import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createPromotionalMessage,
  updatePromotionalMessage,
  type PromotionalMessagePayload,
} from '../../api/home'
import type { PromotionalMessage } from '../../data/home'
import { ApiError } from '../../lib/api'
import { homeFieldClass, homeLabelClass, homeSectionPath } from './homeUi'

type PromoMessageFormProps = {
  mode: 'create' | 'edit'
  initial?: PromotionalMessage
}

export function PromoMessageForm({ mode, initial }: PromoMessageFormProps) {
  const navigate = useNavigate()
  const isEdit = mode === 'edit'
  const backTo = homeSectionPath('promos')

  const [message, setMessage] = useState(initial?.message ?? '')
  const [order, setOrder] = useState(String(initial?.order ?? 0))
  const [active, setActive] = useState(initial?.active ?? true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function buildPayload(): PromotionalMessagePayload | null {
    const trimmed = message.trim()
    const orderNum = Number(order)

    if (!trimmed) {
      setError('Message is required.')
      return null
    }
    if (!Number.isInteger(orderNum)) {
      setError('Sort order must be a whole number.')
      return null
    }

    setError('')
    return {
      message: trimmed,
      order: orderNum,
      active,
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
        await updatePromotionalMessage(initial.id, payload)
      } else {
        await createPromotionalMessage(payload)
      }
      navigate(backTo, { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to save promotional message.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-up px-6 py-6 lg:px-8">
      <div className="mb-6">
        <Link
          to={backTo}
          className="text-[0.85rem] font-medium text-muted transition hover:text-burgundy"
        >
          ← Home · Promo messages
        </Link>
        <h1 className="mt-2 font-display text-[1.85rem] font-semibold text-admin-ink">
          {isEdit ? 'Edit promo message' : 'Add promo message'}
        </h1>
        <p className="mt-1 text-[0.88rem] text-muted">
          {isEdit
            ? 'Update ticker text, order, and visibility'
            : 'Create a homepage promotional ticker message'}
        </p>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        noValidate
        className="max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
      >
        <div className="space-y-5 p-5 sm:p-6">
          {isEdit && initial ? (
            <div className="rounded-lg bg-admin-bg px-3 py-2.5 text-[0.8rem] text-muted">
              ID <span className="font-medium text-admin-ink">{initial.id}</span>
            </div>
          ) : null}

          <label className="flex flex-col gap-1.5">
            <span className={homeLabelClass}>Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Free shipping on orders above ₹1999 · New festive drops every Friday"
              className={`${homeFieldClass} resize-y`}
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={homeLabelClass}>Sort order</span>
            <input
              type="number"
              min={0}
              step={1}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className={homeFieldClass}
            />
            <span className="text-[0.75rem] text-muted-light">
              Lower numbers appear earlier in the ticker.
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-burgundy"
            />
            <span>
              <span className="block text-[0.9rem] text-admin-ink">Active on storefront</span>
              <span className="mt-0.5 block text-[0.75rem] text-muted-light">
                When off, the message is hidden from the public homepage.
              </span>
            </span>
          </label>

          {error ? (
            <p className="text-[0.85rem] text-burgundy-soft" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border/60 bg-admin-bg/40 px-5 py-4 sm:px-6">
          <Link
            to={backTo}
            className="rounded-lg px-4 py-2.5 text-[0.88rem] font-medium text-muted transition hover:text-admin-ink"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create message'}
          </button>
        </div>
      </form>
    </div>
  )
}

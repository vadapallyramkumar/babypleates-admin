import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  fetchOrder,
  formatOrderDate,
  ORDER_STATUS_LABEL,
  paymentLabel,
  updateOrder,
  type Order,
  type OrderStatus,
} from '../api/orders'
import { OrderStatusBadge, PageHeader } from '../components/admin/ui'
import { NoticeBanner } from '../components/NoticeBanner'
import { formatINR } from '../data/store'
import { useNotice } from '../hooks/useNotice'
import { ApiError } from '../lib/api'

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  new: { status: 'confirmed', label: 'Confirm' },
  confirmed: { status: 'shipped', label: 'Mark shipped' },
  shipped: { status: 'delivered', label: 'Mark delivered' },
}

export function OrderDetailPage() {
  const { id = '' } = useParams()
  const { notice, showSuccess, showError, dismiss } = useNotice()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchOrder(id)
      setOrder(data)
      setNotes(data.notes ?? '')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load order.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function patch(body: { status?: OrderStatus; notes?: string }) {
    if (!order) return
    setSaving(true)
    try {
      const updated = await updateOrder(order.id, body)
      setOrder(updated)
      setNotes(updated.notes ?? '')
      showSuccess(
        body.status
          ? `Order marked ${ORDER_STATUS_LABEL[updated.status].toLowerCase()}.`
          : 'Notes saved.',
      )
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to update order.')
    } finally {
      setSaving(false)
    }
  }

  const next = order ? NEXT_STATUS[order.status] : undefined
  const canCancel =
    order && order.status !== 'delivered' && order.status !== 'cancelled'

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <PageHeader
        title={order?.id ?? 'Order'}
        subtitle={
          loading
            ? 'Loading…'
            : order
              ? `${order.customer.name} · ${formatOrderDate(order.createdAt)}`
              : undefined
        }
        meta={
          <Link
            to="/orders"
            className="text-[0.85rem] font-medium text-sidebar-active transition hover:text-burgundy"
          >
            ← All orders
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
        <div className="mt-6 h-48 animate-pulse rounded-2xl bg-border/40" />
      ) : order ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_280px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[1.05rem] font-semibold text-admin-ink">Items</h2>
                <OrderStatusBadge status={order.status} />
              </div>
              <ul className="mt-4 divide-y divide-border">
                {order.items.map((item) => (
                  <li
                    key={`${item.variantId}-${item.qty}`}
                    className="flex items-start justify-between gap-4 py-3 text-[0.9rem]"
                  >
                    <div>
                      <p className="font-medium text-admin-ink">{item.productName}</p>
                      <p className="text-[0.82rem] text-muted">
                        {[item.color, item.size, `Qty ${item.qty}`].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <p className="font-medium text-admin-ink">
                      {formatINR(item.unitPrice * item.qty)}
                    </p>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-1 border-t border-border pt-4 text-[0.9rem]">
                <div className="flex justify-between text-muted">
                  <dt>Subtotal</dt>
                  <dd>{formatINR(order.totals.subtotal)}</dd>
                </div>
                {order.totals.discount > 0 ? (
                  <div className="flex justify-between text-muted">
                    <dt>Discount{order.coupon?.code ? ` (${order.coupon.code})` : ''}</dt>
                    <dd>−{formatINR(order.totals.discount)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between text-muted">
                  <dt>Shipping</dt>
                  <dd>
                    {order.totals.shipping === 0 ? 'Free' : formatINR(order.totals.shipping)}
                  </dd>
                </div>
                <div className="flex justify-between pt-1 font-semibold text-admin-ink">
                  <dt>Total</dt>
                  <dd>{formatINR(order.totals.total)}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <h2 className="text-[1.05rem] font-semibold text-admin-ink">Customer</h2>
              <dl className="mt-4 grid gap-3 text-[0.9rem] sm:grid-cols-2">
                <div>
                  <dt className="text-[0.75rem] text-muted">Name</dt>
                  <dd className="text-admin-ink">{order.customer.name}</dd>
                </div>
                <div>
                  <dt className="text-[0.75rem] text-muted">Phone</dt>
                  <dd className="text-admin-ink">{order.customer.phone}</dd>
                </div>
                <div>
                  <dt className="text-[0.75rem] text-muted">Email</dt>
                  <dd className="text-admin-ink">{order.customer.email}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[0.75rem] text-muted">Address</dt>
                  <dd className="text-admin-ink">
                    {order.customer.address}
                    <br />
                    {order.customer.city}, {order.customer.state} {order.customer.pincode}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <h2 className="text-[1.05rem] font-semibold text-admin-ink">Fulfillment</h2>
              <p className="mt-2 text-[0.85rem] text-muted">
                {paymentLabel(order.payment.method, order.payment.status)}
              </p>
              {order.payment.razorpayPaymentId ? (
                <p className="mt-1 break-all text-[0.78rem] text-muted">
                  Payment {order.payment.razorpayPaymentId}
                </p>
              ) : null}
              {order.payment.razorpayOrderId ? (
                <p className="mt-1 break-all text-[0.78rem] text-muted">
                  Razorpay {order.payment.razorpayOrderId}
                </p>
              ) : null}

              <div className="mt-4 flex flex-col gap-2">
                {next ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void patch({ status: next.status })}
                    className="rounded-lg bg-burgundy px-3 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark disabled:opacity-50"
                  >
                    {next.label}
                  </button>
                ) : null}
                {canCancel ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      const ok = window.confirm(`Cancel ${order.id}? Stock will be restored.`)
                      if (ok) void patch({ status: 'cancelled' })
                    }}
                    className="rounded-lg bg-admin-bg px-3 py-2.5 text-[0.88rem] font-medium text-admin-ink transition hover:bg-attention-bg hover:text-burgundy disabled:opacity-50"
                  >
                    Cancel order
                  </button>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <h2 className="text-[1.05rem] font-semibold text-admin-ink">Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="mt-3 w-full rounded-lg border border-border bg-white px-3 py-2 text-[0.88rem] text-admin-ink outline-none focus:border-burgundy/30"
              />
              <button
                type="button"
                disabled={saving || notes === (order.notes ?? '')}
                onClick={() => void patch({ notes })}
                className="mt-3 rounded-lg bg-admin-bg px-3 py-2 text-[0.88rem] font-medium text-admin-ink transition hover:bg-border/50 disabled:opacity-50"
              >
                Save notes
              </button>
            </section>
          </aside>
        </div>
      ) : null}
    </div>
  )
}

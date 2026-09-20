import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchOrders,
  formatOrderDate,
  ORDER_STATUS_LABEL,
  paymentLabel,
  type Order,
  type OrderStatus,
  type PaymentMethod,
} from '../api/orders'
import { OrderStatusBadge, PageHeader } from '../components/admin/ui'
import { IconChevronDown, IconSearch } from '../components/icons'
import { formatINR } from '../data/store'
import { ApiError } from '../lib/api'

const STATUS_FILTERS: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'All statuses' },
  { id: 'pending_payment', label: ORDER_STATUS_LABEL.pending_payment },
  { id: 'new', label: ORDER_STATUS_LABEL.new },
  { id: 'confirmed', label: ORDER_STATUS_LABEL.confirmed },
  { id: 'shipped', label: ORDER_STATUS_LABEL.shipped },
  { id: 'delivered', label: ORDER_STATUS_LABEL.delivered },
  { id: 'cancelled', label: ORDER_STATUS_LABEL.cancelled },
]

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [status, setStatus] = useState<'all' | OrderStatus>('all')
  const [payment, setPayment] = useState<'all' | PaymentMethod>('all')

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 250)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const result = await fetchOrders({
          page: 1,
          limit: 50,
          status,
          paymentMethod: payment,
          q: debouncedQuery,
        })
        if (!cancelled) {
          setOrders(result.orders)
          setTotal(result.total)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load orders.')
          setOrders([])
          setTotal(0)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [debouncedQuery, status, payment])

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <PageHeader
        title="Orders"
        subtitle={loading ? 'Loading orders…' : `${total} order${total === 1 ? '' : 's'}`}
      />

      {error ? (
        <p className="mt-4 text-[0.9rem] text-burgundy-soft" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-7 flex flex-wrap gap-3">
        <label className="relative min-w-[220px] flex-1">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-light" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search id, name, phone, email…"
            className="w-full rounded-lg border border-border bg-card py-2.5 pr-3 pl-10 text-[0.9rem] outline-none transition focus:border-burgundy/30 focus:ring-2 focus:ring-burgundy/10"
          />
        </label>

        <label className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | OrderStatus)}
            className="appearance-none rounded-lg border border-border bg-card py-2.5 pr-9 pl-3 text-[0.88rem] text-admin-ink outline-none focus:border-burgundy/30"
          >
            {STATUS_FILTERS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <IconChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-light" />
        </label>

        <label className="relative">
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value as 'all' | PaymentMethod)}
            className="appearance-none rounded-lg border border-border bg-card py-2.5 pr-9 pl-3 text-[0.88rem] text-admin-ink outline-none focus:border-burgundy/30"
          >
            <option value="all">All payments</option>
            <option value="cod">Cash on delivery</option>
            <option value="razorpay">Razorpay</option>
          </select>
          <IconChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-light" />
        </label>
      </div>

      {loading ? (
        <div className="mt-6 space-y-2.5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-border/40" />
          ))}
        </div>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-border md:hidden">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/orders/${order.id}`}
                  className="flex flex-col gap-1.5 py-3.5 transition hover:bg-admin-bg/80"
                >
                  <span className="font-medium text-admin-ink">{order.id}</span>
                  <span className="text-[0.82rem] text-muted">{order.customer.name}</span>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.85rem]">
                    <span className="text-admin-ink">{formatINR(order.totals.total)}</span>
                    <span className="text-muted">
                      {paymentLabel(order.payment.method, order.payment.status)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 hidden overflow-x-auto md:block">
            <div className="grid min-w-[760px] grid-cols-[0.9fr_1.3fr_0.7fr_0.9fr_0.9fr_1fr] gap-3 border-b border-border pb-2 text-[0.68rem] font-medium tracking-[0.08em] text-muted-light uppercase">
              <span>Order</span>
              <span>Customer</span>
              <span>Total</span>
              <span>Payment</span>
              <span>Status</span>
              <span>Placed</span>
            </div>
            <ul className="min-w-[760px] divide-y divide-border">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/orders/${order.id}`}
                    className="grid grid-cols-[0.9fr_1.3fr_0.7fr_0.9fr_0.9fr_1fr] gap-3 py-3.5 text-[0.9rem] transition hover:bg-admin-bg/80"
                  >
                    <span className="font-medium text-admin-ink">{order.id}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-admin-ink">{order.customer.name}</span>
                      <span className="block truncate text-[0.8rem] text-muted">
                        {order.customer.phone}
                      </span>
                    </span>
                    <span className="text-admin-ink">{formatINR(order.totals.total)}</span>
                    <span className="text-muted">
                      {paymentLabel(order.payment.method, order.payment.status)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                    <span className="text-muted">{formatOrderDate(order.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {orders.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted">No orders match your filters.</p>
          ) : null}
        </>
      )}
    </div>
  )
}

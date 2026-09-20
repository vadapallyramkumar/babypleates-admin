import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchSalesDashboard,
  formatOrderDate,
  paymentLabel,
  type SalesDashboard,
  type SalesRange,
} from '../api/orders'
import { OrderStatusBadge, PageHeader, StatCard } from '../components/admin/ui'
import { IconPlus } from '../components/icons'
import { formatINR, greetingForNow } from '../data/store'
import { ApiError } from '../lib/api'

const RANGES: { id: SalesRange; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
]

export function OverviewPage() {
  const [range, setRange] = useState<SalesRange>('30d')
  const [data, setData] = useState<SalesDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const dashboard = await fetchSalesDashboard(range)
        if (!cancelled) setData(dashboard)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load sales.')
          setData(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [range])

  const paymentNote =
    data && data.ordersCount > 0
      ? `${data.codCount} COD · ${data.razorpayCount} online`
      : 'Website checkout'

  return (
    <div className="animate-fade-up px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <PageHeader
        title={greetingForNow()}
        subtitle="Sales from website checkout"
        meta={
          <div className="flex rounded-lg border border-border/70 bg-card p-1">
            {RANGES.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRange(opt.id)}
                className={[
                  'rounded-md px-3 py-1.5 text-[0.8rem] font-medium transition',
                  range === opt.id
                    ? 'bg-accent-pink text-burgundy'
                    : 'text-muted hover:text-admin-ink',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      {error ? (
        <p className="mt-4 text-[0.9rem] text-burgundy-soft" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={loading || !data ? '—' : formatINR(data.revenue)}
          note={loading ? 'Loading' : paymentNote}
        />
        <StatCard
          label="Orders"
          value={loading || !data ? '—' : data.ordersCount}
          note={loading ? 'Loading' : 'Paid / confirmed COD'}
        />
        <StatCard
          label="Average order"
          value={loading || !data ? '—' : formatINR(data.averageOrderValue)}
          note="This period"
          noteTone="muted"
        />
        <StatCard
          label="To ship"
          value={loading || !data ? '—' : data.toShip}
          note={
            data?.awaitingPayment
              ? `${data.awaitingPayment} awaiting payment`
              : 'New + confirmed'
          }
          noteTone={data?.toShip ? 'warning' : 'success'}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Active products"
          value={loading || !data ? '—' : data.productsActive}
          note="Live in catalog"
          noteTone="muted"
        />
        <StatCard
          label="Low stock"
          value={loading || !data ? '—' : data.lowStock}
          note={`At or below ${data?.lowStockThreshold ?? 3}`}
          noteTone="warning"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_240px] xl:gap-6">
        <aside className="order-1 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5 xl:order-2">
          <h2 className="text-[1.05rem] font-semibold text-admin-ink">Quick actions</h2>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3 xl:grid-cols-1">
            <Link
              to="/orders"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-accent-pink px-3 py-2.5 text-[0.88rem] font-medium text-burgundy transition hover:bg-accent-pink-deep"
            >
              View orders
            </Link>
            <Link
              to="/products/new"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-admin-bg px-3 py-2.5 text-[0.88rem] font-medium text-admin-ink transition hover:bg-border/50"
            >
              <IconPlus className="h-4 w-4" />
              Add product
            </Link>
            <Link
              to="/home"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-admin-bg px-3 py-2.5 text-[0.88rem] font-medium text-admin-ink transition hover:bg-border/50"
            >
              Edit homepage
            </Link>
          </div>
        </aside>

        <section className="order-2 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-6 xl:order-1">
          <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
            <h2 className="text-[1.05rem] font-semibold text-admin-ink">Recent orders</h2>
            <Link
              to="/orders"
              className="shrink-0 text-[0.85rem] font-medium text-sidebar-active transition hover:text-burgundy"
            >
              View all →
            </Link>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {(data?.recentOrders ?? []).map((order) => (
              <li key={order.id}>
                <Link
                  to={`/orders/${order.id}`}
                  className="flex flex-col gap-1.5 py-3.5 transition hover:bg-admin-bg/80"
                >
                  <span className="font-medium text-admin-ink">{order.id}</span>
                  <span className="text-[0.82rem] text-muted">{order.customerName}</span>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.85rem]">
                    <span className="text-admin-ink">{formatINR(order.total)}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <div className="grid min-w-[560px] grid-cols-[0.9fr_1.3fr_0.7fr_0.9fr_0.9fr] gap-3 border-b border-border pb-2 text-[0.68rem] font-medium tracking-[0.08em] text-muted-light uppercase">
              <span>Order</span>
              <span>Customer</span>
              <span>Total</span>
              <span>Payment</span>
              <span>Status</span>
            </div>
            <ul className="min-w-[560px] divide-y divide-border">
              {(data?.recentOrders ?? []).map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/orders/${order.id}`}
                    className="grid grid-cols-[0.9fr_1.3fr_0.7fr_0.9fr_0.9fr] gap-3 py-3.5 text-[0.9rem] transition hover:bg-admin-bg/80"
                  >
                    <span className="font-medium text-admin-ink">{order.id}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-admin-ink">{order.customerName}</span>
                      <span className="block text-[0.78rem] text-muted">
                        {formatOrderDate(order.createdAt)}
                      </span>
                    </span>
                    <span className="text-admin-ink">{formatINR(order.total)}</span>
                    <span className="text-muted">
                      {paymentLabel(order.paymentMethod, order.paymentStatus)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {!loading && (data?.recentOrders.length ?? 0) === 0 ? (
            <p className="mt-6 text-sm text-muted">No website orders in this period yet.</p>
          ) : null}
        </section>
      </div>

      {(data?.topProducts.length ?? 0) > 0 ? (
        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-6">
          <h2 className="text-[1.05rem] font-semibold text-admin-ink">Top products</h2>
          <ul className="mt-4 divide-y divide-border">
            {data?.topProducts.map((product) => (
              <li
                key={product.productId}
                className="flex items-center justify-between gap-3 py-3 text-[0.9rem]"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-admin-ink">
                    {product.productName}
                  </span>
                  <span className="text-[0.8rem] text-muted">{product.qty} sold</span>
                </span>
                <span className="font-medium text-admin-ink">{formatINR(product.revenue)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

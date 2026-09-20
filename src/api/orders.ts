import { apiRequest, unwrapData } from '../lib/api'

export type OrderStatus =
  | 'pending_payment'
  | 'new'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentMethod = 'cod' | 'razorpay'
export type PaymentStatus = 'pending' | 'paid' | 'failed'
export type SalesRange = 'today' | '7d' | '30d'

export type OrderItem = {
  productId: string
  variantId: string
  productName: string
  sku?: string
  size?: string
  color?: string
  qty: number
  unitPrice: number
}

export type Order = {
  id: string
  status: OrderStatus
  source: string
  customer: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
  items: OrderItem[]
  totals: {
    subtotal: number
    discount: number
    shipping: number
    total: number
    currency: string
  }
  coupon?: {
    code: string
    discount: number
  }
  payment: {
    method: PaymentMethod
    status: PaymentStatus
    razorpayOrderId?: string
    razorpayPaymentId?: string
  }
  notes?: string
  createdAt: string
  updatedAt: string
}

export type DashboardRecentOrder = {
  id: string
  customerName: string
  total: number
  currency: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  createdAt: string
}

export type DashboardTopProduct = {
  productId: string
  productName: string
  qty: number
  revenue: number
}

export type SalesDashboard = {
  range: SalesRange
  from: string
  revenue: number
  discountGiven?: number
  ordersCount: number
  averageOrderValue: number
  toShip: number
  awaitingPayment: number
  codCount: number
  razorpayCount: number
  recentOrders: DashboardRecentOrder[]
  topProducts: DashboardTopProduct[]
  productsActive: number
  lowStock: number
  lowStockThreshold: number
}

type OrdersListResponse = {
  data: Order[]
  meta?: { page: number; limit: number; total: number }
}

export async function fetchOrders(params?: {
  page?: number
  limit?: number
  status?: OrderStatus | 'all'
  paymentMethod?: PaymentMethod | 'all'
  q?: string
}): Promise<{ orders: Order[]; total: number }> {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 50
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  if (params?.status && params.status !== 'all') query.set('status', params.status)
  if (params?.paymentMethod && params.paymentMethod !== 'all') {
    query.set('paymentMethod', params.paymentMethod)
  }
  if (params?.q?.trim()) query.set('q', params.q.trim())

  const payload = await apiRequest<OrdersListResponse>(`/v1/orders?${query.toString()}`)
  return {
    orders: payload.data ?? [],
    total: payload.meta?.total ?? payload.data?.length ?? 0,
  }
}

export async function fetchOrder(id: string): Promise<Order> {
  const payload = await apiRequest<unknown>(`/v1/orders/${encodeURIComponent(id)}`)
  return unwrapData<Order>(payload)
}

export async function updateOrder(
  id: string,
  body: { status?: OrderStatus; notes?: string },
): Promise<Order> {
  const payload = await apiRequest<unknown>(`/v1/orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body,
  })
  return unwrapData<Order>(payload)
}

export async function fetchSalesDashboard(range: SalesRange = '30d'): Promise<SalesDashboard> {
  const payload = await apiRequest<unknown>(
    `/v1/dashboard/sales?range=${encodeURIComponent(range)}`,
  )
  return unwrapData<SalesDashboard>(payload)
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'Awaiting payment',
  new: 'New',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function paymentLabel(method: PaymentMethod, status: PaymentStatus) {
  if (method === 'cod') return status === 'paid' ? 'COD · paid' : 'COD'
  if (status === 'paid') return 'Paid online'
  if (status === 'failed') return 'Payment failed'
  return 'Unpaid'
}

export function formatOrderDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

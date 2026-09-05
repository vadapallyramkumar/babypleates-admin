import { apiRequest, unwrapData } from '../lib/api'
import type { Product } from '../data/products'

export type ProductWritePayload = Omit<Product, 'createdAt' | 'updatedAt'> & {
  createdAt?: string
  updatedAt?: string
}

type ProductsListResponse = {
  data: Product[]
  meta?: { page: number; limit: number; total: number }
}

export async function fetchProducts(params?: {
  page?: number
  limit?: number
  includeInactive?: boolean
}): Promise<{ products: Product[]; total: number }> {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 100
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  if (params?.includeInactive) {
    query.set('includeInactive', 'true')
  }
  const payload = await apiRequest<ProductsListResponse | { data: Product[] }>(
    `/v1/products?${query.toString()}`,
  )

  if (payload && typeof payload === 'object' && Array.isArray((payload as ProductsListResponse).data)) {
    const list = payload as ProductsListResponse
    return {
      products: list.data,
      total: list.meta?.total ?? list.data.length,
    }
  }

  const data = unwrapData<Product[]>(payload)
  return { products: data, total: data.length }
}

export async function fetchProductBySlug(
  slug: string,
  options?: { includeInactive?: boolean },
): Promise<Product> {
  const query = new URLSearchParams()
  if (options?.includeInactive) {
    query.set('includeInactive', 'true')
  }
  const qs = query.toString()
  const path = `/v1/products/${encodeURIComponent(slug)}${qs ? `?${qs}` : ''}`
  const payload = await apiRequest<unknown>(path)
  return unwrapData<Product>(payload)
}

export async function createProduct(body: ProductWritePayload): Promise<Product> {
  const payload = await apiRequest<unknown>('/v1/products', {
    method: 'POST',
    body,
  })
  return unwrapData<Product>(payload)
}

export async function updateProduct(
  id: string,
  body: Partial<ProductWritePayload>,
): Promise<Product> {
  const payload = await apiRequest<unknown>(`/v1/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body,
  })
  return unwrapData<Product>(payload)
}

export async function deleteProduct(id: string): Promise<void> {
  await apiRequest(`/v1/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

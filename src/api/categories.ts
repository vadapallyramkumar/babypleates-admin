import { apiRequest, unwrapData } from '../lib/api'
import type { Category } from '../data/categories'

export type CategoryPayload = {
  id: string
  slug: string
  name: string
  image: string
  description: string
  sortOrder: number
  isActive: boolean
  filter?: string
}

export async function fetchCategories(): Promise<Category[]> {
  const payload = await apiRequest<unknown>('/v1/categories')
  const data = unwrapData<Category[]>(payload)
  return [...data].sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function createCategory(body: CategoryPayload): Promise<Category> {
  const payload = await apiRequest<unknown>('/v1/categories', {
    method: 'POST',
    body,
  })
  return unwrapData<Category>(payload)
}

export async function updateCategory(
  id: string,
  body: Partial<CategoryPayload>,
): Promise<Category> {
  const payload = await apiRequest<unknown>(`/v1/categories/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body,
  })
  return unwrapData<Category>(payload)
}

export async function deleteCategory(id: string): Promise<void> {
  await apiRequest(`/v1/categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

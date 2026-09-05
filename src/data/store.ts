export type { Category } from './categories'
export { categories, getCategoryById } from './categories'

export type {
  ColorGallery,
  Product,
  ProductListStatus,
  ProductPrice,
  ProductVariant,
} from './products'
export {
  emptyProduct,
  getCategoryName,
  getProductById,
  getProductColorCount,
  getProductListPrice,
  getProductListStatus,
  getProductSizeCount,
  getProductTotalStock,
  isProductOutOfStock,
  markProductInStock,
  markProductOutOfStock,
  normalizeProduct,
  products,
} from './products'

import { categories } from './categories'
import { products } from './products'

export type InventoryItem = {
  id: string
  label: string
  sku: string
  stock: number
}

export const inventoryItems: InventoryItem[] = [
  { id: 'inv-1', label: 'Rose / 4Y', sku: 'bp-001-ROS-4Y', stock: 1 },
  { id: 'inv-2', label: 'Peach / 3Y', sku: 'bp-006-PEA-3Y', stock: 2 },
  { id: 'inv-3', label: 'Blue / 6Y', sku: 'bp-007-ROY-6Y', stock: 1 },
  { id: 'inv-4', label: 'Orange / 4Y', sku: 'bp-008-SUN-4Y', stock: 1 },
  { id: 'inv-5', label: 'Ivory / 2Y', sku: 'bp-002-IVO-2Y', stock: 2 },
  { id: 'inv-6', label: 'Lavender / 5Y', sku: 'bp-005-LAV-5Y', stock: 1 },
  { id: 'inv-7', label: 'Gold / 3Y', sku: 'bp-001-GOL-3Y', stock: 2 },
  { id: 'inv-8', label: 'Royal / 4Y', sku: 'bp-004-ROY-4Y', stock: 1 },
]

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function greetingForNow(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function stockToneClass(stock: number): string {
  if (stock <= 1) return 'text-warning'
  if (stock <= 3) return 'text-warning-soft'
  return 'text-success'
}

export const overviewStats = {
  totalProducts: products.length,
  productsDelta: '+2 this month',
  categories: categories.length,
  categoriesNote: 'All active',
  lowStock: inventoryItems.length,
  lowStockNote: 'Needs attention',
  featured: products.filter((p) => p.featured).length,
  featuredNote: 'Live on homepage',
}

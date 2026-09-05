import { categories, type Category } from './categories'

export type ProductPrice = {
  selling: number
  original: number
  currency: string
}

export type ProductVariant = {
  id: string
  sku: string
  size: string
  color: string
  price: ProductPrice
  stock: number
  isActive: boolean
  discountPercent?: number
  /** Saved when marking out of stock so stock can be restored */
  previousStock?: number
}

export type ColorGallery = {
  color: string
  images: string[]
}

export type Product = {
  id: string
  slug: string
  name: string
  categoryId: string
  description: string
  /** Optional — API omits this field when null/empty */
  fabric?: string
  care: string[]
  images: string[]
  colorGalleries: ColorGallery[]
  variants: ProductVariant[]
  isNew: boolean
  featured: boolean
  isActive: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  /** Derived fields returned by the API list/detail payloads */
  priceFrom?: ProductPrice
  sizes?: string[]
  colors?: string[]
  stock?: number
}

/** Normalize API payloads so optional/omitted fields are safe for the editor. */
export function normalizeProduct(raw: Product): Product {
  return {
    ...raw,
    fabric: raw.fabric ?? '',
    care: raw.care ?? [],
    images: raw.images ?? [],
    colorGalleries: raw.colorGalleries ?? [],
    variants: raw.variants ?? [],
    tags: raw.tags ?? [],
    description: raw.description ?? '',
  }
}

export type ProductListStatus = 'Active' | 'Low stock' | 'Out of stock' | 'Inactive'

export const products: Product[] = [
  {
    id: 'bp-001',
    slug: 'rose-kanjeevaram-pattu-pavadai',
    name: 'Rose Kanjeevaram Pattu Pavadai',
    categoryId: 'pattu-pavada-sets',
    description:
      'A soft rose Kanjeevaram pavadai with delicate border work — made for festivals and first blessings.',
    fabric: 'Semi Kanjeevaram silk',
    care: ['Dry clean recommended.', 'Store folded with tissue.'],
    images: ['/pattu.png', '/pattupavvadi.jpg', '/hero1.png'],
    colorGalleries: [
      { color: 'Rose', images: ['/pattu.png', '/pattupavvadi.jpg'] },
      { color: 'Gold', images: ['/hero1.png'] },
    ],
    variants: [
      {
        id: 'bp-001-ROS-1Y',
        sku: 'bp-001-ROS-1Y',
        size: '1Y',
        color: 'Rose',
        price: { selling: 2499, original: 2999, currency: 'INR' },
        stock: 4,
        isActive: true,
      },
      {
        id: 'bp-001-ROS-2Y',
        sku: 'bp-001-ROS-2Y',
        size: '2Y',
        color: 'Rose',
        price: { selling: 2699, original: 3199, currency: 'INR' },
        stock: 3,
        isActive: true,
      },
      {
        id: 'bp-001-ROS-3Y',
        sku: 'bp-001-ROS-3Y',
        size: '3Y',
        color: 'Rose',
        price: { selling: 2899, original: 3399, currency: 'INR' },
        stock: 2,
        isActive: true,
      },
      {
        id: 'bp-001-ROS-4Y',
        sku: 'bp-001-ROS-4Y',
        size: '4Y',
        color: 'Rose',
        price: { selling: 3099, original: 3599, currency: 'INR' },
        stock: 1,
        isActive: true,
      },
      {
        id: 'bp-001-GOL-2Y',
        sku: 'bp-001-GOL-2Y',
        size: '2Y',
        color: 'Gold',
        price: { selling: 2999, original: 3499, currency: 'INR' },
        stock: 2,
        isActive: true,
      },
      {
        id: 'bp-001-GOL-3Y',
        sku: 'bp-001-GOL-3Y',
        size: '3Y',
        color: 'Gold',
        price: { selling: 3199, original: 3699, currency: 'INR' },
        stock: 1,
        isActive: true,
      },
      {
        id: 'bp-001-GOL-4Y',
        sku: 'bp-001-GOL-4Y',
        size: '4Y',
        color: 'Gold',
        price: { selling: 3399, original: 3899, currency: 'INR' },
        stock: 0,
        isActive: true,
      },
    ],
    isNew: false,
    featured: true,
    isActive: true,
    tags: ['ready-to-dispatch', 'bestseller'],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'bp-002',
    slug: 'ivory-gold-aari-gown',
    name: 'Ivory & Gold Aari Gown',
    categoryId: 'aari-work-frocks',
    description: 'Ivory gown with gold aari work for celebrations.',
    fabric: 'Silk blend',
    care: ['Dry clean only.'],
    images: ['/aari-gown.png'],
    colorGalleries: [{ color: 'Ivory', images: ['/aari-gown.png'] }],
    variants: [
      {
        id: 'bp-002-IVO-2Y',
        sku: 'bp-002-IVO-2Y',
        size: '2Y',
        color: 'Ivory',
        price: { selling: 2899, original: 3299, currency: 'INR' },
        stock: 4,
        isActive: true,
      },
      {
        id: 'bp-002-IVO-3Y',
        sku: 'bp-002-IVO-3Y',
        size: '3Y',
        color: 'Ivory',
        price: { selling: 2999, original: 3399, currency: 'INR' },
        stock: 4,
        isActive: true,
      },
    ],
    isNew: true,
    featured: true,
    isActive: true,
    tags: ['new'],
    createdAt: '2026-08-05T00:00:00.000Z',
    updatedAt: '2026-08-05T00:00:00.000Z',
  },
  {
    id: 'bp-003',
    slug: 'peach-blossom-frock',
    name: 'Peach Blossom Frock',
    categoryId: 'ethnic-silk-frocks',
    description: 'Soft peach frock for everyday festive wear.',
    fabric: 'Silk cotton',
    care: ['Gentle wash.'],
    images: ['/peach-frock.png'],
    colorGalleries: [{ color: 'Peach', images: ['/peach-frock.png'] }],
    variants: [
      {
        id: 'bp-003-PEA-2Y',
        sku: 'bp-003-PEA-2Y',
        size: '2Y',
        color: 'Peach',
        price: { selling: 1499, original: 1799, currency: 'INR' },
        stock: 1,
        isActive: true,
      },
      {
        id: 'bp-003-PEA-3Y',
        sku: 'bp-003-PEA-3Y',
        size: '3Y',
        color: 'Peach',
        price: { selling: 1499, original: 1799, currency: 'INR' },
        stock: 1,
        isActive: true,
      },
    ],
    isNew: false,
    featured: false,
    isActive: true,
    tags: [],
    createdAt: '2026-07-20T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z',
  },
  {
    id: 'bp-004',
    slug: 'royal-blue-pattu-gown',
    name: 'Royal Blue Pattu Gown',
    categoryId: 'ethnic-silk-frocks',
    description: 'Royal blue pattu gown with contrast border.',
    fabric: 'Pattu silk',
    care: ['Dry clean recommended.'],
    images: ['/blue-gown.png'],
    colorGalleries: [{ color: 'Royal', images: ['/blue-gown.png'] }],
    variants: [
      {
        id: 'bp-004-ROY-4Y',
        sku: 'bp-004-ROY-4Y',
        size: '4Y',
        color: 'Royal',
        price: { selling: 2599, original: 2999, currency: 'INR' },
        stock: 1,
        isActive: true,
      },
    ],
    isNew: false,
    featured: true,
    isActive: true,
    tags: ['festive'],
    createdAt: '2026-07-12T00:00:00.000Z',
    updatedAt: '2026-07-12T00:00:00.000Z',
  },
  {
    id: 'bp-005',
    slug: 'lavender-aari-work-set',
    name: 'Lavender Aari Work Set',
    categoryId: 'aari-work-pavada',
    description: 'Lavender pavada set with fine aari work.',
    fabric: 'Georgette',
    care: ['Dry clean only.'],
    images: ['/lavender-set.png'],
    colorGalleries: [{ color: 'Lavender', images: ['/lavender-set.png'] }],
    variants: [
      {
        id: 'bp-005-LAV-5Y',
        sku: 'bp-005-LAV-5Y',
        size: '5Y',
        color: 'Lavender',
        price: { selling: 2399, original: 2799, currency: 'INR' },
        stock: 5,
        isActive: true,
      },
      {
        id: 'bp-005-LAV-4Y',
        sku: 'bp-005-LAV-4Y',
        size: '4Y',
        color: 'Lavender',
        price: { selling: 2299, original: 2699, currency: 'INR' },
        stock: 5,
        isActive: true,
      },
    ],
    isNew: false,
    featured: true,
    isActive: true,
    tags: ['bestseller'],
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
  },
  {
    id: 'bp-006',
    slug: 'sunshine-orange-pavadai',
    name: 'Sunshine Orange Pavadai',
    categoryId: 'budget-friendly',
    description: 'Bright orange pavadai for everyday celebrations.',
    fabric: 'Cotton silk',
    care: ['Gentle wash.'],
    images: ['/orange-pavadai.png'],
    colorGalleries: [{ color: 'Orange', images: ['/orange-pavadai.png'] }],
    variants: [
      {
        id: 'bp-006-SUN-3Y',
        sku: 'bp-006-SUN-3Y',
        size: '3Y',
        color: 'Orange',
        price: { selling: 1299, original: 1499, currency: 'INR' },
        stock: 2,
        isActive: true,
      },
      {
        id: 'bp-006-SUN-4Y',
        sku: 'bp-006-SUN-4Y',
        size: '4Y',
        color: 'Orange',
        price: { selling: 1299, original: 1499, currency: 'INR' },
        stock: 1,
        isActive: true,
      },
    ],
    isNew: false,
    featured: false,
    isActive: true,
    tags: ['budget'],
    createdAt: '2026-06-18T00:00:00.000Z',
    updatedAt: '2026-06-18T00:00:00.000Z',
  },
  {
    id: 'bp-007',
    slug: 'kota-cotton-summer-set',
    name: 'Kota Cotton Summer Set',
    categoryId: 'kota-collection',
    description: 'Breathable kota cotton set for summer days.',
    fabric: 'Kota cotton',
    care: ['Machine wash cold.'],
    images: ['/kota-set.png'],
    colorGalleries: [
      { color: 'Blue', images: ['/kota-set.png'] },
      { color: 'Mint', images: ['/kota-mint.png'] },
    ],
    variants: [
      {
        id: 'bp-007-BLU-3Y',
        sku: 'bp-007-BLU-3Y',
        size: '3Y',
        color: 'Blue',
        price: { selling: 1699, original: 1999, currency: 'INR' },
        stock: 3,
        isActive: true,
      },
      {
        id: 'bp-007-BLU-4Y',
        sku: 'bp-007-BLU-4Y',
        size: '4Y',
        color: 'Blue',
        price: { selling: 1699, original: 1999, currency: 'INR' },
        stock: 3,
        isActive: true,
      },
    ],
    isNew: true,
    featured: true,
    isActive: true,
    tags: ['summer', 'new'],
    createdAt: '2026-08-10T00:00:00.000Z',
    updatedAt: '2026-08-10T00:00:00.000Z',
  },
]

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getProductTotalStock(product: Product): number {
  // Prefer live variant totals so Visibility “Out of stock” updates the sidebar immediately
  if (product.variants?.length) {
    return product.variants.reduce((sum, v) => sum + v.stock, 0)
  }
  if (typeof product.stock === 'number') return product.stock
  return 0
}

export function getProductListPrice(product: Product): number {
  if (product.priceFrom?.selling != null) return product.priceFrom.selling
  if (product.variants.length === 0) return 0
  return Math.min(...product.variants.map((v) => v.price.selling))
}

export function getProductListStatus(product: Product): ProductListStatus {
  if (!product.isActive) return 'Inactive'
  const stock = getProductTotalStock(product)
  if (stock <= 0) return 'Out of stock'
  if (stock <= 3) return 'Low stock'
  return 'Active'
}

export function isProductOutOfStock(product: Product): boolean {
  const variants = product.variants ?? []
  return variants.length > 0 && variants.every((v) => v.stock <= 0)
}

/** Soft out-of-stock: stock → 0, previousStock remembered for restore. */
export function markProductOutOfStock(variants: ProductVariant[]): ProductVariant[] {
  return variants.map((v) => ({
    ...v,
    previousStock: v.stock > 0 ? v.stock : (v.previousStock ?? 0),
    stock: 0,
  }))
}

/** Restore stock from previousStock (defaults to 1 if none saved). */
export function markProductInStock(variants: ProductVariant[]): ProductVariant[] {
  return variants.map((v) => {
    const restored = v.previousStock != null && v.previousStock > 0 ? v.previousStock : 1
    const { previousStock: _, ...rest } = v
    return { ...rest, stock: restored }
  })
}

export function getProductColorCount(product: Product): number {
  return new Set(product.variants.map((v) => v.color)).size
}

export function getProductSizeCount(product: Product): number {
  return new Set(product.variants.map((v) => v.size)).size
}

export function getCategoryName(categoryId: string, cats: Category[] = categories): string {
  return cats.find((c) => c.id === categoryId)?.name ?? categoryId
}

export function emptyProduct(): Product {
  const now = new Date().toISOString()
  return {
    id: '',
    slug: '',
    name: '',
    categoryId: categories[0]?.id ?? '',
    description: '',
    fabric: '',
    care: [''],
    images: [],
    colorGalleries: [],
    variants: [],
    isNew: true,
    featured: false,
    isActive: true,
    tags: [],
    createdAt: now,
    updatedAt: now,
  }
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCategories } from '../api/categories'
import { deleteProduct, fetchProducts } from '../api/products'
import { PageHeader, StatusBadge } from '../components/admin/ui'
import { IconChevronDown, IconPlus, IconSearch, IconTrash } from '../components/icons'
import {
  formatINR,
  getCategoryName,
  getProductListPrice,
  getProductListStatus,
  getProductTotalStock,
  stockToneClass,
  type Category,
  type Product,
  type ProductListStatus,
} from '../data/store'
import { ApiError } from '../lib/api'

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState<'all' | ProductListStatus>('all')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [{ products: list }, cats] = await Promise.all([
        fetchProducts({ page: 1, limit: 100 }),
        fetchCategories(),
      ])
      setProducts(list)
      setCategories(cats)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load products.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const categoryOptions = useMemo(() => {
    const byId = new Map(categories.map((c) => [c.id, c.name]))
    const ids = Array.from(new Set(products.map((p) => p.categoryId)))
    return ids
      .map((id) => ({ id, name: byId.get(id) ?? getCategoryName(id, categories) }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [products, categories])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((product) => {
      if (category !== 'all' && product.categoryId !== category) return false
      const listStatus = getProductListStatus(product)
      if (status !== 'all' && listStatus !== status) return false
      if (!q) return true
      const catName = getCategoryName(product.categoryId, categories).toLowerCase()
      return (
        product.name.toLowerCase().includes(q) ||
        product.slug.toLowerCase().includes(q) ||
        product.id.toLowerCase().includes(q) ||
        catName.includes(q)
      )
    })
  }, [products, categories, query, category, status])

  async function handleDelete(product: Product) {
    const ok = window.confirm(`Delete product “${product.name}”?`)
    if (!ok) return
    setDeletingId(product.id)
    setError('')
    try {
      await deleteProduct(product.id)
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete product.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="animate-fade-up px-8 py-8 lg:px-10">
      <PageHeader
        title="Products"
        subtitle={
          loading
            ? 'Loading products…'
            : 'Manage products, variants, pricing and visibility'
        }
        action={
          <Link
            to="/products/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark"
          >
            <IconPlus className="h-4 w-4" />
            Add product
          </Link>
        }
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
            placeholder="Search products..."
            className="w-full rounded-lg border border-border bg-card py-2.5 pr-3 pl-10 text-[0.9rem] outline-none transition focus:border-burgundy/30 focus:ring-2 focus:ring-burgundy/10"
          />
        </label>

        <label className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-card py-2.5 pr-9 pl-3 text-[0.88rem] text-admin-ink outline-none focus:border-burgundy/30"
          >
            <option value="all">All categories</option>
            {categoryOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
          <IconChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-light" />
        </label>

        <label className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'all' | ProductListStatus)}
            className="appearance-none rounded-lg border border-border bg-card py-2.5 pr-9 pl-3 text-[0.88rem] text-admin-ink outline-none focus:border-burgundy/30"
          >
            <option value="all">Status</option>
            <option value="Active">Active</option>
            <option value="Low stock">Low stock</option>
            <option value="Inactive">Inactive</option>
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
        <div className="mt-6 overflow-x-auto">
          <div className="mb-2 grid min-w-[860px] grid-cols-[1.8fr_1.2fr_0.6fr_0.7fr_0.5fr_0.7fr_72px] gap-3 px-4 text-[0.68rem] font-medium tracking-[0.08em] text-muted-light uppercase">
            <span>Product</span>
            <span>Category</span>
            <span>Variants</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Status</span>
            <span />
          </div>

          <ul className="flex min-w-[860px] flex-col gap-2.5">
            {filtered.map((product) => {
              const stock = getProductTotalStock(product)
              return (
                <li key={product.id} className="flex items-stretch gap-2">
                  <Link
                    to={`/products/${product.slug}?tab=details`}
                    className="grid min-w-0 flex-1 grid-cols-[1.8fr_1.2fr_0.6fr_0.7fr_0.5fr_0.7fr] items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3.5 text-[0.9rem] shadow-sm transition hover:border-burgundy/20 hover:shadow"
                  >
                    <span className="font-semibold text-admin-ink">{product.name}</span>
                    <span className="text-muted">
                      {getCategoryName(product.categoryId, categories)}
                    </span>
                    <span className="text-admin-ink">{product.variants.length}</span>
                    <span className="text-admin-ink">
                      {formatINR(getProductListPrice(product))}
                    </span>
                    <span className={`font-medium ${stockToneClass(stock)}`}>{stock}</span>
                    <StatusBadge status={getProductListStatus(product)} />
                  </Link>
                  <button
                    type="button"
                    title="Delete product"
                    aria-label={`Delete ${product.name}`}
                    disabled={deletingId === product.id}
                    onClick={() => void handleDelete(product)}
                    className="inline-flex items-center justify-center rounded-xl border border-border/50 bg-card px-3 text-muted shadow-sm transition hover:bg-attention-bg hover:text-burgundy disabled:opacity-50"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </li>
              )
            })}
          </ul>

          {filtered.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted">No products match your filters.</p>
          ) : null}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCategories } from '../api/categories'
import { fetchProducts } from '../api/products'
import { PageHeader, StatCard, StatusBadge } from '../components/admin/ui'
import { IconArrowUpRight, IconPlus } from '../components/icons'
import {
  formatINR,
  getCategoryName,
  getProductListPrice,
  getProductListStatus,
  getProductTotalStock,
  greetingForNow,
  stockToneClass,
  type Category,
  type Product,
} from '../data/store'

export function OverviewPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [{ products: list }, cats] = await Promise.all([
          fetchProducts({ page: 1, limit: 100 }),
          fetchCategories(),
        ])
        if (!cancelled) {
          setProducts(list)
          setCategories(cats)
        }
      } catch {
        if (!cancelled) {
          setProducts([])
          setCategories([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const recent = products.slice(0, 5)
  const lowStock = products.filter((p) => getProductTotalStock(p) <= 3).length
  const featured = products.filter((p) => p.featured).length

  return (
    <div className="animate-fade-up px-8 py-8 lg:px-10">
      <PageHeader
        title={greetingForNow()}
        subtitle="Manage your BabyPleates store"
        meta={
          <span className="text-[0.8rem] text-muted-light">
            {loading ? 'Syncing…' : 'Live from API'}
          </span>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Products"
          value={loading ? '—' : products.length}
          note={loading ? 'Loading' : 'From catalog'}
        />
        <StatCard
          label="Categories"
          value={loading ? '—' : categories.length}
          note={loading ? 'Loading' : 'All loaded'}
        />
        <StatCard
          label="Low Stock"
          value={loading ? '—' : lowStock}
          note="Needs attention"
          noteTone="warning"
        />
        <StatCard
          label="Featured"
          value={loading ? '—' : featured}
          note="Live on homepage"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_240px]">
        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[1.05rem] font-semibold text-admin-ink">Products</h2>
            <Link
              to="/products"
              className="text-[0.85rem] font-medium text-sidebar-active transition hover:text-burgundy"
            >
              View all →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <div className="grid min-w-[640px] grid-cols-[1.6fr_1.2fr_0.7fr_0.5fr_0.8fr] gap-3 border-b border-border pb-2 text-[0.68rem] font-medium tracking-[0.08em] text-muted-light uppercase">
              <span>Product</span>
              <span>Category</span>
              <span>Price</span>
              <span>Stock</span>
              <span>Status</span>
            </div>
            <ul className="min-w-[640px] divide-y divide-border">
              {recent.map((product) => {
                const stock = getProductTotalStock(product)
                return (
                  <li key={product.id}>
                    <Link
                      to={`/products/${product.slug}?tab=details`}
                      className="grid grid-cols-[1.6fr_1.2fr_0.7fr_0.5fr_0.8fr] gap-3 py-3.5 text-[0.9rem] transition hover:bg-admin-bg/80"
                    >
                      <span className="font-medium text-admin-ink">{product.name}</span>
                      <span className="text-muted">
                        {getCategoryName(product.categoryId, categories)}
                      </span>
                      <span className="text-admin-ink">
                        {formatINR(getProductListPrice(product))}
                      </span>
                      <span className={stockToneClass(stock)}>{stock}</span>
                      <StatusBadge status={getProductListStatus(product)} />
                    </Link>
                  </li>
                )
              })}
            </ul>
            {!loading && recent.length === 0 ? (
              <p className="mt-6 text-sm text-muted">No products yet.</p>
            ) : null}
          </div>
        </section>

        <aside className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h2 className="text-[1.05rem] font-semibold text-admin-ink">Quick actions</h2>
          <div className="mt-4 flex flex-col gap-2.5">
            <Link
              to="/products/new"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-accent-pink px-3 py-2.5 text-[0.88rem] font-medium text-burgundy transition hover:bg-accent-pink-deep"
            >
              <IconPlus className="h-4 w-4" />
              Add product
            </Link>
            <Link
              to="/categories/new"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-admin-bg px-3 py-2.5 text-[0.88rem] font-medium text-admin-ink transition hover:bg-border/50"
            >
              <IconPlus className="h-4 w-4" />
              Add category
            </Link>
            <a
              href="#storefront"
              onClick={(e) => e.preventDefault()}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-admin-bg px-3 py-2.5 text-[0.88rem] font-medium text-admin-ink transition hover:bg-border/50"
            >
              <IconArrowUpRight className="h-4 w-4" />
              Open storefront
            </a>
          </div>
        </aside>
      </div>
    </div>
  )
}

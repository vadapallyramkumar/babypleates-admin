import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { fetchCategories } from '../api/categories'
import { createProduct, fetchProductBySlug, updateProduct } from '../api/products'
import { MediaImageList } from '../components/media/MediaImageList'
import { VariantsPanel } from '../components/products/VariantsPanel'
import {
  emptyProduct,
  getProductColorCount,
  getProductSizeCount,
  getProductTotalStock,
  isProductOutOfStock,
  markProductInStock,
  markProductOutOfStock,
  normalizeProduct,
  stockToneClass,
  type Category,
  type Product,
} from '../data/store'
import { ApiError } from '../lib/api'
import { slugify } from '../lib/slug'
import { noticeLocationState } from '../components/NoticeBanner'

const tabs = [
  { id: 'details', label: 'Details' },
  { id: 'variants', label: 'Variants' },
  { id: 'visibility', label: 'Visibility' },
] as const

type TabId = (typeof tabs)[number]['id']

function isTabId(value: string | null): value is TabId {
  return tabs.some((tab) => tab.id === value)
}

const fieldClass =
  'w-full rounded-lg border border-border bg-white px-3 py-2.5 text-[0.9rem] text-admin-ink outline-none transition placeholder:text-muted-light focus:border-burgundy/40 focus:ring-2 focus:ring-burgundy/15'

const labelClass = 'text-[0.8rem] font-medium text-admin-ink'

type ProductEditorProps = {
  mode: 'create' | 'edit'
  initial: Product
  categories: Category[]
}

function ProductEditor({ mode, initial, categories }: ProductEditorProps) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [draft, setDraft] = useState<Product>(initial)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const tabParam = searchParams.get('tab')
  const activeTab: TabId = isTabId(tabParam) ? tabParam : 'details'

  const colorCount = getProductColorCount(draft)
  const sizeCount = getProductSizeCount(draft)
  const totalStock = getProductTotalStock(draft)

  function setTab(next: TabId) {
    setSearchParams({ tab: next })
  }

  function update<K extends keyof Product>(key: K, value: Product[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function handleNameChange(name: string) {
    setDraft((prev) => {
      const next = { ...prev, name }
      // Only auto-derive slug/id when creating — rewriting slug on edit breaks saves
      // (API unique constraint) and can 404 the product URL.
      if (mode === 'create') {
        const slug = slugify(name)
        next.slug = slug || ''
        next.id = slug ? `bp-${slug}` : ''
      }
      return next
    })
  }

  async function handleSave() {
    const name = draft.name?.trim() ?? ''
    const slug = draft.slug?.trim() ?? ''
    const fabric = (draft.fabric ?? '').trim()
    const description = (draft.description ?? '').trim()
    const care = (draft.care ?? []).map((c) => c.trim()).filter(Boolean)
    const tags = (draft.tags ?? []).map((t) => t.trim()).filter(Boolean)
    const images = draft.images ?? []
    const variants = draft.variants ?? []

    if (!name) {
      setError('Name is required.')
      setTab('details')
      return
    }
    if (!slug) {
      setError('Slug is required.')
      setTab('details')
      return
    }
    if (!draft.categoryId) {
      setError('Category is required.')
      setTab('details')
      return
    }
    if (images.length === 0) {
      setError('Add at least one product image before saving.')
      setTab('details')
      return
    }
    if (variants.length === 0) {
      setError('Add at least one variant (color/size) before saving.')
      setTab('variants')
      return
    }

    const payload: Product = {
      ...draft,
      id: draft.id || `bp-${slug}`,
      name,
      slug,
      description,
      fabric,
      care,
      tags,
      images,
      variants,
      colorGalleries: draft.colorGalleries ?? [],
      updatedAt: new Date().toISOString(),
      createdAt: draft.createdAt || new Date().toISOString(),
    }

    setSaving(true)
    setError('')
    try {
      if (mode === 'create') {
        await createProduct(payload)
      } else {
        await updateProduct(payload.id, payload)
      }
      navigate('/products', {
        replace: true,
        state: noticeLocationState(
          mode === 'create' ? 'Product created.' : 'Product updated.',
        ),
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="sticky top-[3.35rem] z-20 border-b border-border/60 bg-admin-bg/95 px-6 py-4 backdrop-blur-sm lg:top-0 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              to="/products"
              className="text-[0.85rem] font-medium text-muted transition hover:text-burgundy"
            >
              ← Products
            </Link>
            <h1 className="mt-1 font-display text-[1.85rem] font-semibold text-admin-ink">
              {mode === 'create' ? 'Add product' : 'Edit Product'}
            </h1>
            <p className="mt-0.5 text-[0.88rem] text-muted">
              {draft.name || 'Untitled product'}
              {draft.id ? ` • ${draft.id}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="shrink-0 rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Product'}
          </button>
        </div>
      </div>

      <div className="px-6 py-6 lg:px-8">
        {error ? (
          <p className="mb-4 text-[0.85rem] text-burgundy-soft" role="alert">
            {error}
          </p>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="grid lg:grid-cols-[220px_1fr]">
            <aside className="border-b border-border/60 p-5 lg:border-r lg:border-b-0">
              <p className="text-[0.68rem] font-medium tracking-[0.12em] text-muted-light uppercase">
                Product
              </p>
              <nav className="mt-3 flex flex-col gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTab(tab.id)}
                    className={[
                      'rounded-lg px-3 py-2 text-left text-[0.9rem] transition',
                      activeTab === tab.id
                        ? 'bg-accent-pink font-medium text-burgundy'
                        : 'text-admin-ink hover:bg-admin-bg',
                    ].join(' ')}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="mt-8">
                <p className="text-[0.68rem] font-medium tracking-[0.12em] text-muted-light uppercase">
                  Variants summary
                </p>
                <p className="mt-2 text-[0.95rem] font-semibold text-admin-ink">
                  {colorCount} color{colorCount === 1 ? '' : 's'}
                </p>
                <p className="text-[0.8rem] text-muted">
                  {sizeCount} size{sizeCount === 1 ? '' : 's'}
                </p>
                <p className={`mt-1 text-[0.8rem] font-medium ${stockToneClass(totalStock)}`}>
                  {totalStock} total stock
                </p>
              </div>

              <div className="mt-6 rounded-xl bg-accent-pink/50 px-3.5 py-3">
                <p className="text-[0.78rem] leading-relaxed text-burgundy">
                  Add colors with images and manage sizes, pricing and stock for each
                  color.
                </p>
              </div>
            </aside>

            <div className="p-5 sm:p-6">
              {activeTab === 'details' ? (
                <DetailsPanel
                  draft={draft}
                  categories={categories}
                  onNameChange={handleNameChange}
                  // onSlugChange={(slug) => {
                  //   setSlugTouched(true)
                  //   update('slug', slugify(slug))
                  // }}
                  onChange={update}
                />
              ) : null}
              {activeTab === 'variants' ? (
                <VariantsPanel draft={draft} onChange={update} />
              ) : null}
              {activeTab === 'visibility' ? (
                <VisibilityPanel draft={draft} onChange={update} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailsPanel({
  draft,
  categories,
  onNameChange,
  // onSlugChange,
  onChange,
}: {
  draft: Product
  categories: Category[]
  onNameChange: (name: string) => void
  // onSlugChange: (slug: string) => void
  onChange: <K extends keyof Product>(key: K, value: Product[K]) => void
}) {
  return (
    <div className="max-w-2xl space-y-5">
      <h2 className="text-[1.05rem] font-semibold text-admin-ink">Product details</h2>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Name</span>
        <input
          className={fieldClass}
          value={draft.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Rose Kanjeevaram Pattu Pavadai"
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Slug</span>
          <input
            className={fieldClass}
            value={draft.slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="rose-kanjeevaram-pattu-pavadai"
          />
        </label> */}
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Category</span>
          <select
            className={fieldClass}
            value={draft.categoryId}
            onChange={(e) => onChange('categoryId', e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.isActive ? cat.name : `${cat.name} (Inactive)`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Description</span>
        <textarea
          className={`${fieldClass} resize-y`}
          rows={4}
          value={draft.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="A soft rose Kanjeevaram pavadai…"
        />
      </label>

      <div>
        <div className="mb-2">
          <span className={labelClass}>Product images</span>
          <p className="mt-0.5 text-[0.78rem] text-muted">
            Shared gallery used as product defaults — pick from the media library
          </p>
        </div>
        <MediaImageList
          urls={draft.images}
          onChange={(images) => onChange('images', images)}
          emptyLabel="Opens the media library so you can pick product images"
          addLabel="Add image"
        />
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Fabric (optional)</span>
        <input
          className={fieldClass}
          value={draft.fabric ?? ''}
          onChange={(e) => onChange('fabric', e.target.value)}
          placeholder="Semi Kanjeevaram silk"
        />
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className={labelClass}>Care instructions (optional)</span>
          <button
            type="button"
            onClick={() => onChange('care', [...(draft.care ?? []), ''])}
            className="text-[0.78rem] font-medium text-burgundy hover:text-burgundy-dark"
          >
            + Add line
          </button>
        </div>
        <div className="space-y-2">
          {(draft.care ?? []).map((line, index) => (
            <div key={index} className="flex gap-2">
              <input
                className={fieldClass}
                value={line}
                onChange={(e) => {
                  const next = [...(draft.care ?? [])]
                  next[index] = e.target.value
                  onChange('care', next)
                }}
                placeholder="Dry clean recommended."
              />
              <button
                type="button"
                onClick={() =>
                  onChange(
                    'care',
                    (draft.care ?? []).filter((_, i) => i !== index),
                  )
                }
                className="shrink-0 rounded-lg px-2 text-[0.8rem] text-muted hover:text-burgundy"
              >
                Remove
              </button>
            </div>
          ))}
          {(draft.care ?? []).length === 0 ? (
            <p className="text-[0.8rem] text-muted">No care lines yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function VisibilityPanel({
  draft,
  onChange,
}: {
  draft: Product
  onChange: <K extends keyof Product>(key: K, value: Product[K]) => void
}) {
  const tagsText = (draft.tags ?? []).join(', ')
  const outOfStock = isProductOutOfStock(draft)
  const hasVariants = (draft.variants ?? []).length > 0

  function handleOutOfStockChange(checked: boolean) {
    if (!hasVariants) return
    onChange(
      'variants',
      checked
        ? markProductOutOfStock(draft.variants)
        : markProductInStock(draft.variants),
    )
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-[1.05rem] font-semibold text-admin-ink">Visibility</h2>
        <p className="mt-1 text-[0.82rem] text-muted">
          Controls how this product appears in the shop. Nothing here permanently
          deletes data — turn flags back on anytime.
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-border/60 bg-admin-bg/40 p-4">
        <p className="text-[0.68rem] font-medium tracking-[0.12em] text-muted-light uppercase">
          Availability
        </p>

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(e) => onChange('isActive', e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-burgundy"
          />
          <span>
            <span className="block text-[0.9rem] text-admin-ink">Active on storefront</span>
            <span className="mt-0.5 block text-[0.75rem] text-muted-light">
              When off, the product is hidden from the shop but kept in admin
              (same idea as inactive categories). Uncheck to soft-hide; check again
              to publish.
            </span>
          </span>
        </label>

        <label
          className={[
            'flex items-start gap-2.5',
            hasVariants ? 'cursor-pointer' : 'cursor-not-allowed opacity-60',
          ].join(' ')}
        >
          <input
            type="checkbox"
            checked={outOfStock}
            disabled={!hasVariants}
            onChange={(e) => handleOutOfStockChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-burgundy"
          />
          <span>
            <span className="block text-[0.9rem] text-admin-ink">Out of stock</span>
            <span className="mt-0.5 block text-[0.75rem] text-muted-light">
              {hasVariants
                ? 'Sets all variant stock to 0 so the shop shows “Out of stock”. Previous stock is remembered and restored when you uncheck. Product stays in the API.'
                : 'Add at least one variant first (Variants tab).'}
            </span>
          </span>
        </label>
      </section>

      <section className="space-y-3 rounded-xl border border-border/60 bg-admin-bg/40 p-4">
        <p className="text-[0.68rem] font-medium tracking-[0.12em] text-muted-light uppercase">
          Merchandising
        </p>

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={draft.featured}
            onChange={(e) => onChange('featured', e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-burgundy"
          />
          <span>
            <span className="block text-[0.9rem] text-admin-ink">Featured</span>
            <span className="mt-0.5 block text-[0.75rem] text-muted-light">
              Highlights the product in featured / bestseller areas on the storefront.
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={draft.isNew}
            onChange={(e) => onChange('isNew', e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-burgundy"
          />
          <span>
            <span className="block text-[0.9rem] text-admin-ink">Mark as new</span>
            <span className="mt-0.5 block text-[0.75rem] text-muted-light">
              Shows it in “new arrivals” and can display a New badge.
            </span>
          </span>
        </label>
      </section>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Tags</span>
        <input
          className={fieldClass}
          value={tagsText}
          onChange={(e) =>
            onChange(
              'tags',
              e.target.value
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            )
          }
          placeholder="ready-to-dispatch, bestseller"
        />
        <span className="text-[0.75rem] text-muted-light">
          Comma-separated labels used for filters (e.g. ready-to-dispatch).
        </span>
      </label>
    </div>
  )
}

export function ProductEditPage() {
  const { id: slug = '' } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [item, cats] = await Promise.all([
          fetchProductBySlug(slug, { includeInactive: true }),
          fetchCategories({ includeInactive: true }),
        ])
        if (cancelled) return
        setProduct(normalizeProduct(item))
        setCategories(cats)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load product.')
          setMissing(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="animate-fade-up px-6 py-10 text-[0.9rem] text-muted">Loading product…</div>
    )
  }

  if (missing || !product) {
    if (error) {
      return (
        <div className="animate-fade-up px-6 py-10 text-[0.9rem] text-burgundy-soft" role="alert">
          {error}
        </div>
      )
    }
    return <Navigate to="/products" replace />
  }

  return (
    <ProductEditor
      key={product.id}
      mode="edit"
      initial={product}
      categories={categories}
    />
  )
}

export function ProductCreatePage() {
  const [initial, setInitial] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const cats = await fetchCategories({ includeInactive: true })
        if (cancelled) return
        setCategories(cats)
        const base = emptyProduct()
        if (cats[0]) base.categoryId = cats[0].id
        setInitial(base)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load categories.')
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

  if (loading || !initial) {
    return (
      <div className="animate-fade-up px-6 py-10 text-[0.9rem] text-muted">Loading…</div>
    )
  }

  if (error && categories.length === 0) {
    return (
      <div className="animate-fade-up px-6 py-10 text-[0.9rem] text-burgundy-soft" role="alert">
        {error}
      </div>
    )
  }

  return <ProductEditor mode="create" initial={initial} categories={categories} />
}

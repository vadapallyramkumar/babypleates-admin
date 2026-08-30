import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { fetchCategories } from '../api/categories'
import { createProduct, fetchProductBySlug, updateProduct } from '../api/products'
import { IconPlus } from '../components/icons'
import {
  emptyProduct,
  getProductColorCount,
  getProductSizeCount,
  getProductTotalStock,
  stockToneClass,
  type Category,
  type ColorGallery,
  type Product,
  type ProductVariant,
} from '../data/store'
import { ApiError } from '../lib/api'
import { slugify } from '../lib/slug'

const tabs = [
  { id: 'details', label: 'Details' },
  { id: 'media', label: 'Media' },
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
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
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
      if (!slugTouched) {
        const slug = slugify(name)
        next.slug = slug
        if (mode === 'create') next.id = slug ? `bp-${slug}` : ''
      }
      return next
    })
  }

  async function handleSave() {
    if (!draft.name.trim()) {
      setError('Name is required.')
      setTab('details')
      return
    }
    if (!draft.slug.trim()) {
      setError('Slug is required.')
      setTab('details')
      return
    }
    if (!draft.categoryId) {
      setError('Category is required.')
      setTab('details')
      return
    }

    const payload: Product = {
      ...draft,
      id: draft.id || `bp-${draft.slug}`,
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      description: draft.description.trim(),
      fabric: draft.fabric.trim(),
      care: draft.care.map((c) => c.trim()).filter(Boolean),
      tags: draft.tags.map((t) => t.trim()).filter(Boolean),
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
      navigate('/products', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-up px-6 py-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/products"
            className="text-[0.85rem] font-medium text-muted transition hover:text-burgundy"
          >
            ← Products
          </Link>
          <h1 className="mt-2 font-display text-[1.85rem] font-semibold text-admin-ink">
            {mode === 'create' ? 'Add product' : 'Edit Product'}
          </h1>
          <p className="mt-1 text-[0.88rem] text-muted">
            {draft.name || 'Untitled product'}
            {draft.id ? ` • ${draft.id}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark disabled:opacity-60"
        >
          {saving
            ? 'Saving…'
            : mode === 'create'
              ? 'Create product'
              : 'Save changes'}
        </button>
      </div>

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
                Variant summary
              </p>
              <p className="mt-2 text-[0.95rem] font-semibold text-admin-ink">
                {draft.variants.length} variants
              </p>
              <p className="text-[0.8rem] text-muted">
                {colorCount} colours • {sizeCount} sizes
              </p>
              <p className={`mt-1 text-[0.8rem] font-medium ${stockToneClass(totalStock)}`}>
                {totalStock} total stock
              </p>
            </div>
          </aside>

          <div className="p-5 sm:p-6">
            {activeTab === 'details' ? (
              <DetailsPanel
                draft={draft}
                categories={categories}
                onNameChange={handleNameChange}
                onSlugChange={(slug) => {
                  setSlugTouched(true)
                  update('slug', slugify(slug))
                }}
                onChange={update}
              />
            ) : null}
            {activeTab === 'media' ? (
              <MediaPanel draft={draft} onChange={update} />
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
  )
}

function DetailsPanel({
  draft,
  categories,
  onNameChange,
  onSlugChange,
  onChange,
}: {
  draft: Product
  categories: Category[]
  onNameChange: (name: string) => void
  onSlugChange: (slug: string) => void
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
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Slug</span>
          <input
            className={fieldClass}
            value={draft.slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="rose-kanjeevaram-pattu-pavadai"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Category</span>
          <select
            className={fieldClass}
            value={draft.categoryId}
            onChange={(e) => onChange('categoryId', e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
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

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Fabric</span>
        <input
          className={fieldClass}
          value={draft.fabric}
          onChange={(e) => onChange('fabric', e.target.value)}
          placeholder="Semi Kanjeevaram silk"
        />
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className={labelClass}>Care instructions</span>
          <button
            type="button"
            onClick={() => onChange('care', [...draft.care, ''])}
            className="text-[0.78rem] font-medium text-burgundy hover:text-burgundy-dark"
          >
            + Add line
          </button>
        </div>
        <div className="space-y-2">
          {draft.care.map((line, index) => (
            <div key={index} className="flex gap-2">
              <input
                className={fieldClass}
                value={line}
                onChange={(e) => {
                  const next = [...draft.care]
                  next[index] = e.target.value
                  onChange('care', next)
                }}
                placeholder="Dry clean recommended."
              />
              <button
                type="button"
                onClick={() => onChange('care', draft.care.filter((_, i) => i !== index))}
                className="shrink-0 rounded-lg px-2 text-[0.8rem] text-muted hover:text-burgundy"
              >
                Remove
              </button>
            </div>
          ))}
          {draft.care.length === 0 ? (
            <p className="text-[0.8rem] text-muted">No care lines yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function MediaPanel({
  draft,
  onChange,
}: {
  draft: Product
  onChange: <K extends keyof Product>(key: K, value: Product[K]) => void
}) {
  const [selectedColor, setSelectedColor] = useState(
    draft.colorGalleries[0]?.color ?? '',
  )
  const gallery =
    draft.colorGalleries.find((g) => g.color === selectedColor) ?? draft.colorGalleries[0]

  function setImages(images: string[]) {
    onChange('images', images)
  }

  function setColorGalleries(galleries: ColorGallery[]) {
    onChange('colorGalleries', galleries)
    if (!galleries.some((g) => g.color === selectedColor)) {
      setSelectedColor(galleries[0]?.color ?? '')
    }
  }

  function updateGalleryImages(color: string, images: string[]) {
    setColorGalleries(
      draft.colorGalleries.map((g) => (g.color === color ? { ...g, images } : g)),
    )
  }

  function addColorGallery() {
    const color = `Color ${draft.colorGalleries.length + 1}`
    setColorGalleries([...draft.colorGalleries, { color, images: [] }])
    setSelectedColor(color)
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[1.05rem] font-semibold text-admin-ink">Product images</h2>
            <p className="mt-0.5 text-[0.82rem] text-muted">
              Shared gallery paths used as product defaults
            </p>
          </div>
          <button
            type="button"
            onClick={() => setImages([...draft.images, ''])}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-pink px-3 py-2 text-[0.82rem] font-medium text-burgundy transition hover:bg-accent-pink-deep"
          >
            <IconPlus className="h-3.5 w-3.5" />
            Add image path
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {draft.images.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                className={fieldClass}
                value={url}
                onChange={(e) => {
                  const next = [...draft.images]
                  next[index] = e.target.value
                  setImages(next)
                }}
                placeholder="/pattu.png"
              />
              <button
                type="button"
                onClick={() => setImages(draft.images.filter((_, i) => i !== index))}
                className="shrink-0 rounded-lg px-2 text-[0.8rem] text-muted hover:text-burgundy"
              >
                Remove
              </button>
            </div>
          ))}
          {draft.images.length === 0 ? (
            <p className="text-[0.8rem] text-muted">No product images yet.</p>
          ) : null}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[1.05rem] font-semibold text-admin-ink">Color galleries</h2>
            <p className="mt-0.5 text-[0.82rem] text-muted">
              Images grouped by color (matches API colorGalleries)
            </p>
          </div>
          <button
            type="button"
            onClick={addColorGallery}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-pink px-3 py-2 text-[0.82rem] font-medium text-burgundy transition hover:bg-accent-pink-deep"
          >
            <IconPlus className="h-3.5 w-3.5" />
            Add color
          </button>
        </div>

        {draft.colorGalleries.length === 0 ? (
          <p className="mt-4 text-[0.8rem] text-muted">No color galleries yet.</p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {draft.colorGalleries.map((g) => (
                <button
                  key={g.color}
                  type="button"
                  onClick={() => setSelectedColor(g.color)}
                  className={[
                    'rounded-lg px-3 py-1.5 text-[0.82rem] font-medium transition',
                    g.color === (gallery?.color ?? selectedColor)
                      ? 'bg-accent-pink text-burgundy'
                      : 'bg-admin-bg text-muted hover:text-admin-ink',
                  ].join(' ')}
                >
                  {g.color} ({g.images.length})
                </button>
              ))}
            </div>

            {gallery ? (
              <div className="mt-4 space-y-3 rounded-xl border border-border/70 p-4">
                <label className="flex flex-col gap-1.5">
                  <span className={labelClass}>Color name</span>
                  <input
                    className={fieldClass}
                    value={gallery.color}
                    onChange={(e) => {
                      const nextName = e.target.value
                      setColorGalleries(
                        draft.colorGalleries.map((g) =>
                          g.color === gallery.color ? { ...g, color: nextName } : g,
                        ),
                      )
                      setSelectedColor(nextName)
                    }}
                  />
                </label>

                <div className="space-y-2">
                  {gallery.images.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        className={fieldClass}
                        value={url}
                        onChange={(e) => {
                          const next = [...gallery.images]
                          next[index] = e.target.value
                          updateGalleryImages(gallery.color, next)
                        }}
                        placeholder="/pattu.png"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateGalleryImages(
                            gallery.color,
                            gallery.images.filter((_, i) => i !== index),
                          )
                        }
                        className="shrink-0 rounded-lg px-2 text-[0.8rem] text-muted hover:text-burgundy"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateGalleryImages(gallery.color, [...gallery.images, ''])}
                    className="rounded-lg bg-admin-bg px-3 py-2 text-[0.82rem] font-medium text-admin-ink hover:bg-border/50"
                  >
                    Add image path
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setColorGalleries(
                        draft.colorGalleries.filter((g) => g.color !== gallery.color),
                      )
                    }
                    className="rounded-lg px-3 py-2 text-[0.82rem] font-medium text-muted hover:text-burgundy"
                  >
                    Remove color
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  )
}

function VariantsPanel({
  draft,
  onChange,
}: {
  draft: Product
  onChange: <K extends keyof Product>(key: K, value: Product[K]) => void
}) {
  function updateVariant(index: number, patch: Partial<ProductVariant>) {
    const next = draft.variants.map((v, i) => (i === index ? { ...v, ...patch } : v))
    onChange('variants', next)
  }

  function updatePrice(
    index: number,
    key: 'selling' | 'original',
    value: string,
  ) {
    const num = Number(value)
    const variant = draft.variants[index]
    if (!variant) return
    updateVariant(index, {
      price: {
        ...variant.price,
        [key]: Number.isFinite(num) ? num : 0,
      },
    })
  }

  function addVariant() {
    const id = `${draft.id || 'bp-new'}-NEW-${draft.variants.length + 1}`
    onChange('variants', [
      ...draft.variants,
      {
        id,
        sku: id,
        size: '2Y',
        color: 'Rose',
        price: { selling: 0, original: 0, currency: 'INR' },
        stock: 0,
        isActive: true,
      },
    ])
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.05rem] font-semibold text-admin-ink">Variants</h2>
          <p className="mt-0.5 text-[0.82rem] text-muted">
            Size, color, pricing, stock, and active state
          </p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-pink px-3 py-2 text-[0.82rem] font-medium text-burgundy transition hover:bg-accent-pink-deep"
        >
          <IconPlus className="h-3.5 w-3.5" />
          Add variant
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left text-[0.85rem]">
          <thead>
            <tr className="border-b border-border text-[0.68rem] tracking-[0.08em] text-muted-light uppercase">
              <th className="py-2 pr-2 font-medium">SKU</th>
              <th className="py-2 pr-2 font-medium">Color</th>
              <th className="py-2 pr-2 font-medium">Size</th>
              <th className="py-2 pr-2 font-medium">Selling</th>
              <th className="py-2 pr-2 font-medium">Original</th>
              <th className="py-2 pr-2 font-medium">Stock</th>
              <th className="py-2 pr-2 font-medium">Active</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {draft.variants.map((variant, index) => (
              <tr key={variant.id} className="border-b border-border/60">
                <td className="py-2 pr-2">
                  <input
                    className={fieldClass}
                    value={variant.sku}
                    onChange={(e) => updateVariant(index, { sku: e.target.value, id: e.target.value || variant.id })}
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    className={fieldClass}
                    value={variant.color}
                    onChange={(e) => updateVariant(index, { color: e.target.value })}
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    className={fieldClass}
                    value={variant.size}
                    onChange={(e) => updateVariant(index, { size: e.target.value })}
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    className={fieldClass}
                    value={variant.price.selling}
                    onChange={(e) => updatePrice(index, 'selling', e.target.value)}
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    className={fieldClass}
                    value={variant.price.original}
                    onChange={(e) => updatePrice(index, 'original', e.target.value)}
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    className={fieldClass}
                    value={variant.stock}
                    onChange={(e) =>
                      updateVariant(index, { stock: Number(e.target.value) || 0 })
                    }
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="checkbox"
                    checked={variant.isActive}
                    onChange={(e) => updateVariant(index, { isActive: e.target.checked })}
                    className="h-4 w-4 accent-burgundy"
                  />
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        'variants',
                        draft.variants.filter((_, i) => i !== index),
                      )
                    }
                    className="text-[0.8rem] text-muted hover:text-burgundy"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {draft.variants.length === 0 ? (
          <p className="mt-4 text-[0.8rem] text-muted">No variants yet.</p>
        ) : null}
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
  const tagsText = draft.tags.join(', ')

  return (
    <div className="max-w-xl space-y-5">
      <h2 className="text-[1.05rem] font-semibold text-admin-ink">Visibility</h2>

      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={draft.isActive}
          onChange={(e) => onChange('isActive', e.target.checked)}
          className="h-4 w-4 accent-burgundy"
        />
        <span className="text-[0.9rem] text-admin-ink">Active on storefront</span>
      </label>

      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={draft.featured}
          onChange={(e) => onChange('featured', e.target.checked)}
          className="h-4 w-4 accent-burgundy"
        />
        <span className="text-[0.9rem] text-admin-ink">Featured</span>
      </label>

      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={draft.isNew}
          onChange={(e) => onChange('isNew', e.target.checked)}
          className="h-4 w-4 accent-burgundy"
        />
        <span className="text-[0.9rem] text-admin-ink">Mark as new</span>
      </label>

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
        <span className="text-[0.75rem] text-muted-light">Comma-separated</span>
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
          fetchProductBySlug(slug),
          fetchCategories(),
        ])
        if (cancelled) return
        setProduct(item)
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
        const cats = await fetchCategories()
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

import { useEffect, useMemo, useState } from 'react'
import {
  type ColorGallery,
  type Product,
  type ProductVariant,
} from '../../data/store'
import { mediaThumbUrl } from '../../lib/mediaUrl'
import { IconClose, IconImage, IconMore, IconPlus, IconTrash } from '../icons'
import { MediaPickerModal } from '../media/MediaPickerModal'

const compactFieldClass =
  'w-full rounded-lg border border-border bg-white px-2.5 py-2 text-[0.85rem] text-admin-ink outline-none transition placeholder:text-muted-light focus:border-burgundy/40 focus:ring-2 focus:ring-burgundy/15'

const SWATCH_FALLBACKS = [
  '#c97a7a',
  '#5b6b9e',
  '#c9a24a',
  '#7a9e66',
  '#8b6b9e',
  '#6b8f9e',
  '#b07a5a',
  '#9e6b7a',
]

const NAMED_SWATCHES: Record<string, string> = {
  rose: '#d4a0a0',
  blue: '#3d4a7a',
  gold: '#c9a24a',
  ivory: '#e8dfd0',
  peach: '#e8b090',
  royal: '#2f3f8f',
  lavender: '#b8a0c8',
  orange: '#e07a3a',
  mint: '#7ab89a',
  pink: '#e8a0b0',
  red: '#c04040',
  green: '#5a8f5a',
  yellow: '#d4c04a',
  purple: '#7a5a9e',
  black: '#2a2a2a',
  white: '#f0ece6',
  cream: '#f0e6d4',
  navy: '#2a3a5a',
}

function swatchForColor(color: string): string {
  const key = color.trim().toLowerCase()
  if (NAMED_SWATCHES[key]) return NAMED_SWATCHES[key]
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return SWATCH_FALLBACKS[hash % SWATCH_FALLBACKS.length] ?? '#c97a7a'
}

function nextSizeLabel(existing: string[]): string {
  const years = existing
    .map((s) => {
      const m = /^(\d+)\s*Y$/i.exec(s.trim())
      return m ? Number(m[1]) : null
    })
    .filter((n): n is number => n != null)
  if (years.length > 0) return `${Math.max(...years) + 1}Y`
  return existing.length === 0 ? '2Y' : `Size ${existing.length + 1}`
}

function makeVariant(
  productId: string,
  color: string,
  size: string,
  seed?: Partial<ProductVariant>,
): ProductVariant {
  const base = productId || 'bp-new'
  const sku = `${base}-${color.slice(0, 3).toUpperCase()}-${size}`.replace(/\s+/g, '')
  return {
    id: sku,
    sku,
    size,
    color,
    price: seed?.price ?? { selling: 0, original: 0, currency: 'INR' },
    stock: seed?.stock ?? 0,
    isActive: seed?.isActive ?? true,
  }
}

type VariantsPanelProps = {
  draft: Product
  onChange: <K extends keyof Product>(key: K, value: Product[K]) => void
}

export function VariantsPanel({ draft, onChange }: VariantsPanelProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [pickerColor, setPickerColor] = useState<string | null>(null)

  const colorNames = useMemo(() => {
    const fromGalleries = draft.colorGalleries.map((g) => g.color)
    const fromVariants = draft.variants.map((v) => v.color)
    const seen = new Set<string>()
    const ordered: string[] = []
    for (const color of [...fromGalleries, ...fromVariants]) {
      if (!color || seen.has(color)) continue
      seen.add(color)
      ordered.push(color)
    }
    return ordered
  }, [draft.colorGalleries, draft.variants])

  const primaryColor = colorNames[0] ?? ''

  function setVariants(variants: ProductVariant[]) {
    onChange('variants', variants)
  }

  function setGalleries(galleries: ColorGallery[]) {
    onChange('colorGalleries', galleries)
  }

  function galleryImages(color: string): string[] {
    return draft.colorGalleries.find((g) => g.color === color)?.images ?? []
  }

  function setGalleryImages(color: string, images: string[]) {
    const existing = draft.colorGalleries.find((g) => g.color === color)
    if (existing) {
      setGalleries(
        draft.colorGalleries.map((g) => (g.color === color ? { ...g, images } : g)),
      )
    } else {
      setGalleries([...draft.colorGalleries, { color, images }])
    }
  }

  function addColor() {
    const color = `Color ${colorNames.length + 1}`
    setGalleries([...draft.colorGalleries, { color, images: [] }])
    setVariants([...draft.variants, makeVariant(draft.id, color, '2Y')])
  }

  function renameColor(from: string, to: string): boolean {
    const next = to.trim()
    if (!next || next === from) return false
    if (colorNames.includes(next)) return false
    setGalleries(
      draft.colorGalleries.map((g) => (g.color === from ? { ...g, color: next } : g)),
    )
    setVariants(draft.variants.map((v) => (v.color === from ? { ...v, color: next } : v)))
    setMenuOpen(null)
    return true
  }

  function removeColor(color: string) {
    setGalleries(draft.colorGalleries.filter((g) => g.color !== color))
    setVariants(draft.variants.filter((v) => v.color !== color))
    setMenuOpen(null)
  }

  function makePrimary(color: string) {
    const rest = colorNames.filter((c) => c !== color)
    const order = [color, ...rest]
    const galleryMap = new Map(draft.colorGalleries.map((g) => [g.color, g]))
    setGalleries(
      order.map((c) => galleryMap.get(c) ?? { color: c, images: galleryImages(c) }),
    )
    const grouped = order.flatMap((c) => draft.variants.filter((v) => v.color === c))
    const orphans = draft.variants.filter((v) => !order.includes(v.color))
    setVariants([...grouped, ...orphans])
    setMenuOpen(null)
  }

  function addSize(color: string) {
    const sizes = draft.variants.filter((v) => v.color === color).map((v) => v.size)
    const size = nextSizeLabel(sizes)
    const template = draft.variants.find((v) => v.color === color)
    setVariants([
      ...draft.variants,
      makeVariant(draft.id, color, size, template),
    ])
  }

  function updateVariant(id: string, patch: Partial<ProductVariant>) {
    setVariants(draft.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  function updatePrice(id: string, value: string) {
    const num = Number(value)
    const variant = draft.variants.find((v) => v.id === id)
    if (!variant) return
    updateVariant(id, {
      price: {
        ...variant.price,
        selling: Number.isFinite(num) ? num : 0,
      },
    })
  }

  function removeVariant(id: string) {
    setVariants(draft.variants.filter((v) => v.id !== id))
  }

  function handlePickerSelect(url: string) {
    if (!pickerColor) return
    const images = galleryImages(pickerColor)
    if (!images.includes(url)) setGalleryImages(pickerColor, [...images, url])
    setPickerColor(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.05rem] font-semibold text-admin-ink">Variants</h2>
          <p className="mt-0.5 text-[0.82rem] text-muted">
            Organize sizes under each color and upload images once per color.
          </p>
        </div>
        <button
          type="button"
          onClick={addColor}
          className="inline-flex items-center gap-1.5 rounded-lg bg-burgundy px-3.5 py-2 text-[0.82rem] font-semibold text-white transition hover:bg-burgundy-dark"
        >
          <IconPlus className="h-3.5 w-3.5" />
          Add color
        </button>
      </div>

      {colorNames.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-admin-bg/40 px-5 py-10 text-center">
          <p className="text-[0.9rem] font-medium text-admin-ink">No colors yet</p>
          <p className="mt-1 text-[0.82rem] text-muted">
            Add a color to manage images, sizes, pricing, and stock.
          </p>
          <button
            type="button"
            onClick={addColor}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent-pink px-3 py-2 text-[0.82rem] font-medium text-burgundy transition hover:bg-accent-pink-deep"
          >
            <IconPlus className="h-3.5 w-3.5" />
            Add color
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {colorNames.map((color) => {
            const variants = draft.variants.filter((v) => v.color === color)
            const images = galleryImages(color)
            const stock = variants.reduce((sum, v) => sum + v.stock, 0)
            const isPrimary = color === primaryColor

            return (
              <ColorCard
                key={color}
                color={color}
                isPrimary={isPrimary}
                variants={variants}
                images={images}
                stock={stock}
                menuOpen={menuOpen === color}
                onToggleMenu={() =>
                  setMenuOpen((open) => (open === color ? null : color))
                }
                onRename={(next) => renameColor(color, next)}
                onMakePrimary={() => makePrimary(color)}
                onRemoveColor={() => removeColor(color)}
                onManageImages={() => setPickerColor(color)}
                onRemoveImage={(index) =>
                  setGalleryImages(
                    color,
                    images.filter((_, i) => i !== index),
                  )
                }
                onAddSize={() => addSize(color)}
                onUpdateVariant={updateVariant}
                onUpdatePrice={updatePrice}
                onRemoveVariant={removeVariant}
              />
            )
          })}
        </div>
      )}

      <MediaPickerModal
        open={pickerColor !== null}
        selectedUrl=""
        onClose={() => setPickerColor(null)}
        onSelect={handlePickerSelect}
      />
    </div>
  )
}

function ColorCard({
  color,
  isPrimary,
  variants,
  images,
  stock,
  menuOpen,
  onToggleMenu,
  onRename,
  onMakePrimary,
  onRemoveColor,
  onManageImages,
  onRemoveImage,
  onAddSize,
  onUpdateVariant,
  onUpdatePrice,
  onRemoveVariant,
}: {
  color: string
  isPrimary: boolean
  variants: ProductVariant[]
  images: string[]
  stock: number
  menuOpen: boolean
  onToggleMenu: () => void
  onRename: (next: string) => boolean
  onMakePrimary: () => void
  onRemoveColor: () => void
  onManageImages: () => void
  onRemoveImage: (index: number) => void
  onAddSize: () => void
  onUpdateVariant: (id: string, patch: Partial<ProductVariant>) => void
  onUpdatePrice: (id: string, value: string) => void
  onRemoveVariant: (id: string) => void
}) {
  const [nameDraft, setNameDraft] = useState(color)

  useEffect(() => {
    setNameDraft(color)
  }, [color])

  function commitName() {
    const next = nameDraft.trim()
    if (!next) {
      setNameDraft(color)
      return
    }
    if (next !== color) {
      const ok = onRename(next)
      if (!ok) setNameDraft(color)
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="h-8 w-8 shrink-0 rounded-full shadow-sm ring-2 ring-white"
            style={{ backgroundColor: swatchForColor(color) }}
            aria-hidden
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="min-w-0 max-w-[10rem] border-0 bg-transparent p-0 text-[0.95rem] font-semibold text-admin-ink outline-none focus:ring-0"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur()
                  }
                }}
                aria-label="Color name"
              />
              {isPrimary ? (
                <span className="rounded-full bg-accent-pink px-2 py-0.5 text-[0.68rem] font-medium text-burgundy">
                  Primary
                </span>
              ) : null}
            </div>
            <p className="text-[0.78rem] text-muted">
              {variants.length} size{variants.length === 1 ? '' : 's'} • {stock} stock
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onManageImages}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-[0.8rem] font-medium text-admin-ink transition hover:bg-admin-bg"
          >
            <IconImage className="h-3.5 w-3.5 text-muted" />
            Manage images
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={onToggleMenu}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-admin-bg hover:text-admin-ink"
              aria-label="Color actions"
            >
              <IconMore className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-white py-1 shadow-md">
                {!isPrimary ? (
                  <button
                    type="button"
                    onClick={onMakePrimary}
                    className="block w-full px-3 py-2 text-left text-[0.82rem] text-admin-ink hover:bg-admin-bg"
                  >
                    Set as primary
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onRemoveColor}
                  className="block w-full px-3 py-2 text-left text-[0.82rem] text-burgundy-soft hover:bg-admin-bg"
                >
                  Remove color
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[160px_1fr]">
        <div className="flex flex-col gap-2">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="group relative">
              <div className="overflow-hidden rounded-lg bg-media-placeholder ring-1 ring-border/70">
                <div className="aspect-square">
                  <img
                    src={mediaThumbUrl(url, 240)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveImage(index)}
                className="absolute top-1.5 right-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-admin-ink/70 text-white opacity-0 transition group-hover:opacity-100 hover:bg-burgundy"
                title="Remove"
              >
                <IconClose className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onManageImages}
            className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-admin-bg/40 text-muted transition hover:border-burgundy/40 hover:bg-accent-pink/30 hover:text-burgundy"
          >
            <IconPlus className="h-4 w-4" />
            <span className="text-[0.72rem] font-medium">Add more</span>
          </button>
        </div>

        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[0.85rem]">
            <thead>
              <tr className="text-[0.68rem] tracking-[0.08em] text-muted-light uppercase">
                <th className="pb-2 pr-2 font-medium">Size</th>
                <th className="pb-2 pr-2 font-medium">Price (₹)</th>
                <th className="pb-2 pr-2 font-medium">Stock</th>
                <th className="pb-2 pr-2 font-medium">SKU (optional)</th>
                <th className="pb-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id} className="border-t border-border/50">
                  <td className="py-2 pr-2">
                    <input
                      className={`${compactFieldClass} w-16`}
                      value={variant.size}
                      onChange={(e) =>
                        onUpdateVariant(variant.id, { size: e.target.value })
                      }
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      className={`${compactFieldClass} w-24`}
                      value={variant.price.selling}
                      onChange={(e) => onUpdatePrice(variant.id, e.target.value)}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      className={`${compactFieldClass} w-20`}
                      value={variant.stock}
                      onChange={(e) =>
                        onUpdateVariant(variant.id, {
                          stock: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      className={compactFieldClass}
                      value={variant.sku}
                      onChange={(e) =>
                        onUpdateVariant(variant.id, {
                          sku: e.target.value,
                          id: e.target.value || variant.id,
                        })
                      }
                      placeholder="BP-ROSE-2Y"
                    />
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => onRemoveVariant(variant.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-burgundy-soft transition hover:bg-accent-pink"
                      title="Remove size"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={onAddSize}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-[0.82rem] font-medium text-muted transition hover:border-burgundy/40 hover:bg-accent-pink/20 hover:text-burgundy"
          >
            <IconPlus className="h-3.5 w-3.5" />
            Add size
          </button>
        </div>
      </div>
    </section>
  )
}

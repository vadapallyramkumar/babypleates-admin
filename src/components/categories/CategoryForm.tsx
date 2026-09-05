import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createCategory, updateCategory, type CategoryPayload } from '../../api/categories'
import type { Category } from '../../data/store'
import { ApiError } from '../../lib/api'
import { mediaThumbUrl } from '../../lib/mediaUrl'
import { slugify } from '../../lib/slug'
import { IconImage } from '../icons'
import { MediaPickerModal } from '../media/MediaPickerModal'

const fieldClass =
  'w-full rounded-lg border border-border bg-white px-3 py-2.5 text-[0.9rem] text-admin-ink outline-none transition placeholder:text-muted-light focus:border-burgundy/40 focus:ring-2 focus:ring-burgundy/15'

const labelClass = 'text-[0.8rem] font-medium text-admin-ink'

type CategoryFormProps = {
  mode: 'create' | 'edit'
  initial?: Category
}

export function CategoryForm({ mode, initial }: CategoryFormProps) {
  const navigate = useNavigate()
  const isEdit = mode === 'edit'

  const [name, setName] = useState(initial?.name ?? '')
  const [image, setImage] = useState(initial?.image ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0))
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  function buildPayload(): CategoryPayload | null {
    const trimmedName = name.trim()
    const order = Number(sortOrder)

    if (!trimmedName) {
      setError('Name is required.')
      return null
    }
    if (!image.trim()) {
      setError('Image is required — choose one from the media library.')
      return null
    }
    if (!Number.isFinite(order) || order < 0) {
      setError('Sort order must be a valid number (0 or higher).')
      return null
    }

    const slug = initial?.slug || slugify(trimmedName)
    const id = initial?.id || slug

    setError('')
    return {
      id,
      slug,
      name: trimmedName,
      image: image.trim(),
      description: description.trim(),
      sortOrder: order,
      isActive,
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = buildPayload()
    if (!payload) return

    setSaving(true)
    setError('')
    try {
      if (isEdit && initial) {
        await updateCategory(initial.id, payload)
      } else {
        await createCategory(payload)
      }
      navigate('/categories', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save category.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-up px-6 py-6 lg:px-8">
      <div className="mb-6">
        <Link
          to="/categories"
          className="text-[0.85rem] font-medium text-muted transition hover:text-burgundy"
        >
          ← Categories
        </Link>
        <h1 className="mt-2 font-display text-[1.85rem] font-semibold text-admin-ink">
          {isEdit ? 'Edit category' : 'Add category'}
        </h1>
        <p className="mt-1 text-[0.88rem] text-muted">
          {isEdit
            ? `Update ${initial?.name ?? 'category'} details and visibility`
            : 'Create a storefront category with name, image, and visibility settings'}
        </p>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        noValidate
        className="max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
      >
        <div className="space-y-5 p-5 sm:p-6">
          {isEdit && initial ? (
            <div className="rounded-lg bg-admin-bg px-3 py-2.5 text-[0.8rem] text-muted">
              ID <span className="font-medium text-admin-ink">{initial.id}</span>
              <span className="mx-2 text-border">·</span>
              Slug <span className="font-medium text-admin-ink">{initial.slug}</span>
            </div>
          ) : null}

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Name</span>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Best Sellers"
              className={fieldClass}
              autoFocus
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className={labelClass}>Image</span>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className={[
                'flex w-full items-center gap-4 rounded-xl border border-dashed px-4 py-4 text-left transition',
                image
                  ? 'border-border bg-white hover:border-burgundy/35'
                  : 'border-border bg-admin-bg/40 hover:border-burgundy/40 hover:bg-accent-pink/30',
              ].join(' ')}
            >
              {image ? (
                <>
                  <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-media-placeholder ring-1 ring-border/70">
                    <img
                      src={mediaThumbUrl(image, 128)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.95rem] font-medium text-admin-ink">
                      Image selected
                    </span>
                    <span className="mt-1 block text-[0.82rem] text-muted">
                      Click to choose a different image from media
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-card text-muted ring-1 ring-border/70">
                    <IconImage className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.95rem] font-medium text-admin-ink">
                      Choose from media
                    </span>
                    <span className="mt-1 block text-[0.82rem] text-muted">
                      Opens the media library so you can pick an image
                    </span>
                  </span>
                </>
              )}
            </button>
            {image ? (
              <button
                type="button"
                onClick={() => setImage('')}
                className="self-start text-[0.78rem] font-medium text-muted transition hover:text-burgundy"
              >
                Clear image
              </button>
            ) : null}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Description</span>
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Our most-loved outfits — the ones families come back for."
              className={`${fieldClass} resize-y`}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Sort order</span>
              <input
                type="number"
                name="sortOrder"
                min={0}
                step={1}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={fieldClass}
              />
              <span className="text-[0.75rem] text-muted-light">
                Lower numbers appear first on the storefront. Duplicates are allowed —
                those categories sit next to each other (no unique constraint).
              </span>
            </label>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-burgundy"
            />
            <span>
              <span className="block text-[0.9rem] text-admin-ink">Active on storefront</span>
              <span className="mt-0.5 block text-[0.75rem] text-muted-light">
                When off, the category is hidden from the public shop but kept in admin.
              </span>
            </span>
          </label>

          {error ? (
            <p className="text-[0.85rem] text-burgundy-soft" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border/60 bg-admin-bg/40 px-5 py-4 sm:px-6">
          <Link
            to="/categories"
            className="rounded-lg px-4 py-2.5 text-[0.88rem] font-medium text-muted transition hover:text-admin-ink"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create category'}
          </button>
        </div>
      </form>

      <MediaPickerModal
        open={pickerOpen}
        selectedUrl={image}
        onClose={() => setPickerOpen(false)}
        onSelect={setImage}
      />
    </div>
  )
}

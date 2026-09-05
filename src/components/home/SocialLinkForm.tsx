import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createSocialLink,
  updateSocialLink,
  type SocialLinkPayload,
} from '../../api/home'
import {
  SOCIAL_MEDIA_TYPES,
  socialMediaTypeLabel,
  type SocialLink,
  type SocialMediaType,
} from '../../data/home'
import { ApiError } from '../../lib/api'
import { mediaThumbUrl } from '../../lib/mediaUrl'
import { IconImage } from '../icons'
import { MediaPickerModal } from '../media/MediaPickerModal'
import { homeFieldClass, homeLabelClass, homeSectionPath } from './homeUi'

type SocialLinkFormProps = {
  mode: 'create' | 'edit'
  initial?: SocialLink
}

export function SocialLinkForm({ mode, initial }: SocialLinkFormProps) {
  const navigate = useNavigate()
  const isEdit = mode === 'edit'
  const backTo = homeSectionPath('trending')

  const [type, setType] = useState<SocialMediaType>(initial?.type ?? 'image')
  const [url, setUrl] = useState(initial?.url ?? '')
  const [order, setOrder] = useState(String(initial?.order ?? 0))
  const [active, setActive] = useState(initial?.active ?? true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  function buildPayload(): SocialLinkPayload | null {
    const orderNum = Number(order)

    if (!url.trim()) {
      setError(`Choose a ${type} from the media library.`)
      return null
    }
    if (!Number.isInteger(orderNum)) {
      setError('Sort order must be a whole number.')
      return null
    }

    setError('')
    return {
      url: url.trim(),
      type,
      order: orderNum,
      active,
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
        await updateSocialLink(initial.id, payload)
      } else {
        await createSocialLink(payload)
      }
      navigate(backTo, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save trending item.')
    } finally {
      setSaving(false)
    }
  }

  function handleTypeChange(next: SocialMediaType) {
    setType(next)
    // Clear media when switching type so image/video stay consistent
    if (url) setUrl('')
  }

  return (
    <div className="animate-fade-up px-6 py-6 lg:px-8">
      <div className="mb-6">
        <Link
          to={backTo}
          className="text-[0.85rem] font-medium text-muted transition hover:text-burgundy"
        >
          ← Home · Trending
        </Link>
        <h1 className="mt-2 font-display text-[1.85rem] font-semibold text-admin-ink">
          {isEdit ? 'Edit trending item' : 'Add trending item'}
        </h1>
        <p className="mt-1 text-[0.88rem] text-muted">
          {isEdit
            ? 'Update media, type, order, and visibility'
            : 'Add an image or video to the homepage trending section'}
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
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <span className={homeLabelClass}>Type</span>
            <div className="grid grid-cols-2 gap-2">
              {SOCIAL_MEDIA_TYPES.map((t) => {
                const selected = type === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    className={[
                      'rounded-xl border px-3 py-3 text-[0.9rem] font-medium transition',
                      selected
                        ? 'border-burgundy bg-accent-pink/40 text-burgundy ring-1 ring-burgundy/30'
                        : 'border-border/70 bg-white text-admin-ink hover:border-burgundy/35 hover:bg-admin-bg/60',
                    ].join(' ')}
                  >
                    {socialMediaTypeLabel(t)}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={homeLabelClass}>
              {type === 'video' ? 'Video' : 'Image'}
            </span>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className={[
                'flex w-full items-center gap-4 rounded-xl border border-dashed px-4 py-4 text-left transition',
                url
                  ? 'border-border bg-white hover:border-burgundy/35'
                  : 'border-border bg-admin-bg/40 hover:border-burgundy/40 hover:bg-accent-pink/30',
              ].join(' ')}
            >
              {url ? (
                <>
                  <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-media-placeholder ring-1 ring-border/70">
                    {type === 'video' ? (
                      <video
                        src={url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={mediaThumbUrl(url, 128)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.95rem] font-medium text-admin-ink">
                      {type === 'video' ? 'Video selected' : 'Image selected'}
                    </span>
                    <span className="mt-1 block text-[0.82rem] text-muted">
                      Click to choose a different {type}
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
                      Pick a {type} from the media library
                    </span>
                  </span>
                </>
              )}
            </button>
            {url ? (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="self-start text-[0.78rem] font-medium text-muted transition hover:text-burgundy"
              >
                Clear {type}
              </button>
            ) : null}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className={homeLabelClass}>Sort order</span>
            <input
              type="number"
              min={0}
              step={1}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className={homeFieldClass}
            />
            <span className="text-[0.75rem] text-muted-light">
              Lower numbers appear first in trending.
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-burgundy"
            />
            <span>
              <span className="block text-[0.9rem] text-admin-ink">Active on storefront</span>
              <span className="mt-0.5 block text-[0.75rem] text-muted-light">
                When off, the item is hidden from the public homepage.
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
            to={backTo}
            className="rounded-lg px-4 py-2.5 text-[0.88rem] font-medium text-muted transition hover:text-admin-ink"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create trending item'}
          </button>
        </div>
      </form>

      <MediaPickerModal
        open={pickerOpen}
        selectedUrl={url}
        accept={type}
        hint={
          type === 'video'
            ? 'Pick a video from your media library'
            : 'Pick an image from your media library'
        }
        onClose={() => setPickerOpen(false)}
        onSelect={(selected) => {
          setUrl(selected)
          setPickerOpen(false)
        }}
      />
    </div>
  )
}

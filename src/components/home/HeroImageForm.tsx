import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createHeroImage,
  updateHeroImage,
  type HeroImagePayload,
} from '../../api/home'
import type { HeroImage } from '../../data/home'
import { ApiError } from '../../lib/api'
import { mediaThumbUrl } from '../../lib/mediaUrl'
import { IconImage } from '../icons'
import { MediaPickerModal } from '../media/MediaPickerModal'
import { homeFieldClass, homeLabelClass, homeSectionPath } from './homeUi'

type PickerTarget = 'desktop' | 'mobile' | null

type ImageSize = { width: number; height: number }

const DESKTOP_HERO_SIZE = { width: 1920, height: 600 } as const

function loadImageSize(src: string): Promise<ImageSize> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('Failed to read image dimensions'))
    img.src = src
  })
}

type HeroImageFormProps = {
  mode: 'create' | 'edit'
  initial?: HeroImage
}

export function HeroImageForm({ mode, initial }: HeroImageFormProps) {
  const navigate = useNavigate()
  const isEdit = mode === 'edit'
  const backTo = homeSectionPath('heroes')

  const [url, setUrl] = useState(initial?.url ?? '')
  const [mobileUrl, setMobileUrl] = useState(initial?.mobileUrl ?? '')
  const [alt, setAlt] = useState(initial?.alt ?? '')
  const [order, setOrder] = useState(String(initial?.order ?? 0))
  const [active, setActive] = useState(initial?.active ?? true)
  const [error, setError] = useState('')
  const [sizeWarning, setSizeWarning] = useState('')
  const [desktopSize, setDesktopSize] = useState<ImageSize | null>(null)
  const [saving, setSaving] = useState(false)
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null)

  useEffect(() => {
    if (!url) {
      setDesktopSize(null)
      setSizeWarning('')
      return
    }

    let cancelled = false
    void loadImageSize(url)
      .then((size) => {
        if (cancelled) return
        setDesktopSize(size)
        if (
          size.width !== DESKTOP_HERO_SIZE.width ||
          size.height !== DESKTOP_HERO_SIZE.height
        ) {
          setSizeWarning(
            `This image is ${size.width} × ${size.height} px. Desktop heroes should be ${DESKTOP_HERO_SIZE.width} × ${DESKTOP_HERO_SIZE.height} px.`,
          )
        } else {
          setSizeWarning('')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDesktopSize(null)
          setSizeWarning(
            `Could not verify size. Please use a ${DESKTOP_HERO_SIZE.width} × ${DESKTOP_HERO_SIZE.height} px image.`,
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [url])

  function buildPayload(): HeroImagePayload | null {
    const trimmedAlt = alt.trim()
    const orderNum = Number(order)

    if (!url.trim()) {
      setError('Desktop image is required — choose one from the media library.')
      return null
    }
    if (!trimmedAlt) {
      setError('Alt text is required.')
      return null
    }
    if (!Number.isInteger(orderNum)) {
      setError('Sort order must be a whole number.')
      return null
    }

    setError('')
    return {
      url: url.trim(),
      mobileUrl: mobileUrl.trim() ? mobileUrl.trim() : null,
      alt: trimmedAlt,
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
        await updateHeroImage(initial.id, payload)
      } else {
        await createHeroImage(payload)
      }
      navigate(backTo, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save hero image.')
    } finally {
      setSaving(false)
    }
  }

  function ImagePickerButton({
    label,
    value,
    onPick,
    onClear,
    required,
    sizeHint,
    measuredSize,
    sizeWarningText,
  }: {
    label: string
    value: string
    onPick: () => void
    onClear: () => void
    required?: boolean
    sizeHint?: string
    measuredSize?: ImageSize | null
    sizeWarningText?: string
  }) {
    const sizeOk =
      measuredSize &&
      sizeHint &&
      measuredSize.width === DESKTOP_HERO_SIZE.width &&
      measuredSize.height === DESKTOP_HERO_SIZE.height

    return (
      <div className="flex flex-col gap-1.5">
        <span className={homeLabelClass}>
          {label}
          {required ? null : (
            <span className="ml-1 font-normal text-muted-light">(optional)</span>
          )}
        </span>
        {sizeHint ? (
          <span className="text-[0.75rem] text-muted-light">
            Upload / use image at <span className="font-medium text-admin-ink">{sizeHint}</span>
          </span>
        ) : null}
        <button
          type="button"
          onClick={onPick}
          className={[
            'flex w-full items-center gap-4 rounded-xl border border-dashed px-4 py-4 text-left transition',
            value
              ? 'border-border bg-white hover:border-burgundy/35'
              : 'border-border bg-admin-bg/40 hover:border-burgundy/40 hover:bg-accent-pink/30',
          ].join(' ')}
        >
          {value ? (
            <>
              <span className="h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-media-placeholder ring-1 ring-border/70">
                <img
                  src={mediaThumbUrl(value, 224)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.95rem] font-medium text-admin-ink">
                  Image selected
                </span>
                <span className="mt-1 block text-[0.82rem] text-muted">
                  {measuredSize
                    ? `${measuredSize.width} × ${measuredSize.height} px · click to change`
                    : 'Click to choose a different image'}
                </span>
              </span>
            </>
          ) : (
            <>
              <span className="flex h-16 w-28 shrink-0 items-center justify-center rounded-xl bg-card text-muted ring-1 ring-border/70">
                <IconImage className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.95rem] font-medium text-admin-ink">
                  Choose from media
                </span>
                <span className="mt-1 block text-[0.82rem] text-muted">
                  {sizeHint
                    ? `Select a ${sizeHint} banner from the media library`
                    : 'Opens the media library'}
                </span>
              </span>
            </>
          )}
        </button>
        {sizeOk ? (
          <span className="text-[0.75rem] text-success">Correct size (1920 × 600)</span>
        ) : null}
        {sizeWarningText ? (
          <p className="text-[0.78rem] text-warning" role="status">
            {sizeWarningText}
          </p>
        ) : null}
        {value ? (
          <button
            type="button"
            onClick={onClear}
            className="self-start text-[0.78rem] font-medium text-muted transition hover:text-burgundy"
          >
            Clear image
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="animate-fade-up px-6 py-6 lg:px-8">
      <div className="mb-6">
        <Link
          to={backTo}
          className="text-[0.85rem] font-medium text-muted transition hover:text-burgundy"
        >
          ← Home · Hero images
        </Link>
        <h1 className="mt-2 font-display text-[1.85rem] font-semibold text-admin-ink">
          {isEdit ? 'Edit hero image' : 'Add hero image'}
        </h1>
        <p className="mt-1 text-[0.88rem] text-muted">
          {isEdit
            ? 'Update banner image, alt text, and visibility'
            : 'Desktop banner should be 1920 × 600 px; mobile image is optional'}
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

          <ImagePickerButton
            label="Desktop image"
            value={url}
            required
            sizeHint="1920 × 600 px"
            measuredSize={desktopSize}
            sizeWarningText={sizeWarning}
            onPick={() => setPickerTarget('desktop')}
            onClear={() => {
              setUrl('')
              setDesktopSize(null)
              setSizeWarning('')
            }}
          />

          <ImagePickerButton
            label="Mobile image"
            value={mobileUrl}
            onPick={() => setPickerTarget('mobile')}
            onClear={() => setMobileUrl('')}
          />

          <label className="flex flex-col gap-1.5">
            <span className={homeLabelClass}>Alt text</span>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Festive kids wear collection"
              className={homeFieldClass}
              autoFocus
            />
          </label>

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
              Lower numbers appear first in the hero carousel.
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
                When off, the banner is hidden from the public homepage.
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
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create hero image'}
          </button>
        </div>
      </form>

      <MediaPickerModal
        open={pickerTarget !== null}
        selectedUrl={pickerTarget === 'mobile' ? mobileUrl : url}
        hint={
          pickerTarget === 'desktop'
            ? 'Desktop hero: use a 1920 × 600 px image'
            : undefined
        }
        onClose={() => setPickerTarget(null)}
        onSelect={(selected) => {
          if (pickerTarget === 'mobile') setMobileUrl(selected)
          else setUrl(selected)
          setPickerTarget(null)
        }}
      />
    </div>
  )
}

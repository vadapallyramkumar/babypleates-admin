import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { fetchMediaAssets, type MediaAsset } from '../../api/media'
import { mediaThumbUrl } from '../../lib/mediaUrl'
import { IconCheck, IconClose, IconImage } from '../icons'

type MediaAccept = 'image' | 'video' | 'all'

type MediaPickerModalProps = {
  open: boolean
  selectedUrl?: string
  /** Filter library assets by media kind. Defaults to images only. */
  accept?: MediaAccept
  /** Shown under the dialog title, e.g. hero size guidance */
  hint?: string
  onClose: () => void
  onSelect: (url: string) => void
}

function matchesAccept(asset: MediaAsset, accept: MediaAccept): boolean {
  const isVideo = asset.mimeType.startsWith('video/')
  if (accept === 'all') return true
  if (accept === 'video') return isVideo
  return !isVideo
}

export function MediaPickerModal({
  open,
  selectedUrl = '',
  accept = 'image',
  hint,
  onClose,
  onSelect,
}: MediaPickerModalProps) {
  const titleId = useId()
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchMediaAssets()
        if (!cancelled) {
          setAssets(data.filter((asset) => matchesAccept(asset, accept)))
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load media.')
          setAssets([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [open, accept])

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const noun = accept === 'video' ? 'videos' : accept === 'all' ? 'media' : 'images'
  const title =
    accept === 'video' ? 'Choose video' : accept === 'all' ? 'Choose media' : 'Choose image'

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-admin-ink/50 backdrop-blur-[2px]"
        aria-label="Close media picker"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(88dvh,52rem)] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-card shadow-[0_24px_80px_rgba(42,34,31,0.28)] sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[1.2rem] font-semibold text-admin-ink">
              {title}
            </h2>
            <p className="mt-1 text-[0.88rem] text-muted">
              {hint ?? `Pick from your media library`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-admin-bg text-muted transition hover:bg-accent-pink hover:text-burgundy"
          >
            <IconClose className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {error ? (
            <p className="mb-4 text-[0.9rem] text-burgundy-soft" role="alert">
              {error}
            </p>
          ) : null}

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl">
                  <div className="aspect-[4/5] animate-pulse bg-border/40" />
                  <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-border/40" />
                </div>
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-admin-bg/60 px-6 py-16 text-center">
              <IconImage className="mx-auto h-9 w-9 text-muted-light" />
              <p className="mt-4 text-[1.05rem] font-semibold text-admin-ink">
                No {noun} yet
              </p>
              <p className="mx-auto mt-2 max-w-sm text-[0.9rem] text-muted">
                Upload media first, then return here to choose.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {assets.map((asset) => {
                const selected = asset.url === selectedUrl
                const isVideo = asset.mimeType.startsWith('video/')
                return (
                  <li key={asset.publicId}>
                    <button
                      type="button"
                      title={asset.filename}
                      onClick={() => {
                        onSelect(asset.url)
                        onClose()
                      }}
                      className={[
                        'group w-full text-left transition',
                        selected ? 'scale-[0.99]' : 'hover:-translate-y-0.5',
                      ].join(' ')}
                    >
                      <div
                        className={[
                          'relative overflow-hidden rounded-2xl bg-media-placeholder transition',
                          selected
                            ? 'ring-2 ring-burgundy ring-offset-2 ring-offset-card'
                            : 'ring-1 ring-border/80 group-hover:ring-burgundy/35',
                        ].join(' ')}
                      >
                        <div className="aspect-[4/5]">
                          {isVideo ? (
                            <video
                              src={asset.url}
                              muted
                              playsInline
                              preload="metadata"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <img
                              src={mediaThumbUrl(asset.url, 480)}
                              alt={asset.alt || asset.filename}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          )}
                        </div>
                        {isVideo ? (
                          <span className="absolute bottom-2.5 left-2.5 rounded-md bg-admin-ink/75 px-1.5 py-0.5 text-[0.65rem] font-medium tracking-wide text-white uppercase">
                            Video
                          </span>
                        ) : null}
                        {selected ? (
                          <span className="absolute top-2.5 right-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-burgundy text-white shadow-md">
                            <IconCheck className="h-4 w-4" />
                          </span>
                        ) : null}
                        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-admin-ink/55 to-transparent px-3 pt-10 pb-3 opacity-0 transition group-hover:opacity-100">
                          <span className="text-[0.78rem] font-medium text-white">Select</span>
                        </span>
                      </div>
                      <p className="mt-2.5 line-clamp-2 px-0.5 text-[0.86rem] leading-snug font-medium text-admin-ink">
                        {asset.filename}
                      </p>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

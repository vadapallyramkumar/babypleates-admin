import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteMediaImage, fetchMediaAssets, type MediaAsset } from '../api/media'
import { PageHeader } from '../components/admin/ui'
import { IconCheck, IconCopy, IconImage, IconPlus, IconTrash } from '../components/icons'
import { NoticeBanner } from '../components/NoticeBanner'
import { useNotice } from '../hooks/useNotice'
import { mediaThumbUrl } from '../lib/mediaUrl'

type ViewMode = 'grid' | 'list'

const PAGE_SIZE = 24

function formatBytes(bytes: number | null): string {
  if (bytes == null || bytes <= 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isVideo(asset: MediaAsset): boolean {
  return asset.mimeType.startsWith('video/')
}

function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      title={copied ? 'Copied' : 'Copy image URL'}
      aria-label={copied ? 'Copied' : 'Copy image URL'}
      className={[
        'inline-flex shrink-0 items-center justify-center rounded-md p-1 transition',
        copied
          ? 'text-success'
          : 'text-muted-light hover:bg-admin-bg hover:text-burgundy',
      ].join(' ')}
    >
      {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
    </button>
  )
}

function AssetUrlRow({ url, textClassName }: { url: string; textClassName: string }) {
  return (
    <div className="mt-0.5 flex min-w-0 items-center gap-1">
      <p className={`min-w-0 flex-1 truncate ${textClassName}`}>{url}</p>
      {url ? <CopyUrlButton url={url} /> : null}
    </div>
  )
}

function MediaThumb({
  asset,
  size,
  className,
}: {
  asset: MediaAsset
  size: 'grid' | 'list'
  className?: string
}) {
  const width = size === 'grid' ? 480 : 96

  if (!asset.url) {
    return <span className="text-[0.8rem] text-muted">No preview</span>
  }

  if (isVideo(asset)) {
    return (
      <span className="flex flex-col items-center gap-1 text-muted">
        <IconImage className={size === 'grid' ? 'h-8 w-8' : 'h-5 w-5'} />
        {size === 'grid' ? <span className="text-[0.75rem]">Video</span> : null}
      </span>
    )
  }

  return (
    <img
      src={mediaThumbUrl(asset.url, width)}
      alt={asset.alt || asset.filename}
      width={width}
      height={width}
      loading="lazy"
      decoding="async"
      className={className ?? 'h-full w-full object-cover'}
    />
  )
}

export function MediaPage() {
  const { notice, showSuccess, showError, dismiss } = useNotice({
    consumeLocationState: true,
  })
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState<ViewMode>('grid')
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function load(opts?: { silent?: boolean }) {
    if (!opts?.silent) {
      setLoading(true)
      setError('')
    }
    try {
      const data = await fetchMediaAssets()
      setAssets(data)
      if (!opts?.silent) setPage(1)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load media.'
      if (opts?.silent) {
        showError(message)
      } else {
        setError(message)
        setAssets([])
      }
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const pageCount = Math.max(1, Math.ceil(assets.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)

  const visibleAssets = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return assets.slice(start, start + PAGE_SIZE)
  }, [assets, safePage])

  function setViewMode(next: ViewMode) {
    setView(next)
    setPage(1)
  }

  async function handleDelete(asset: MediaAsset) {
    const label = asset.filename || asset.publicId
    if (!window.confirm(`Delete "${label}" from Cloudinary? This cannot be undone.`)) {
      return
    }

    setDeletingId(asset.publicId)
    try {
      await deleteMediaImage(asset.publicId)
      showSuccess(`“${label}” deleted.`)
      await load({ silent: true })
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete image.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="px-8 py-8 lg:px-10">
      <PageHeader
        title="Media"
        subtitle={
          loading
            ? 'Loading library…'
            : assets.length === 0
              ? 'Central media library for products and collections'
              : `${assets.length} asset${assets.length === 1 ? '' : 's'}`
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-border/70 bg-card p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={[
                  'rounded-md px-3 py-1.5 text-[0.78rem] font-medium transition',
                  view === 'grid'
                    ? 'bg-accent-pink text-burgundy'
                    : 'text-muted hover:text-admin-ink',
                ].join(' ')}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={[
                  'rounded-md px-3 py-1.5 text-[0.78rem] font-medium transition',
                  view === 'list'
                    ? 'bg-accent-pink text-burgundy'
                    : 'text-muted hover:text-admin-ink',
                ].join(' ')}
              >
                List
              </button>
            </div>
            <Link
              to="/media/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark"
            >
              <IconPlus className="h-4 w-4" />
              Upload media
            </Link>
          </div>
        }
      />

      {notice ? <NoticeBanner notice={notice} onDismiss={dismiss} /> : null}

      {error ? (
        <p className="mt-6 text-[0.9rem] text-burgundy-soft" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl bg-border/40"
            />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm">
          <p className="text-[1.05rem] font-semibold text-admin-ink">No media yet</p>
          <p className="mx-auto mt-2 max-w-md text-[0.9rem] text-muted">
            Upload images via the API and they will appear here for products and categories.
          </p>
          <Link
            to="/media/new"
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark"
          >
            <IconPlus className="h-4 w-4" />
            Upload media
          </Link>
        </div>
      ) : (
        <>
          {view === 'grid' ? (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleAssets.map((asset) => (
                <li
                  key={asset.publicId}
                  className="group overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm content-visibility-auto"
                >
                  <div className="relative flex aspect-square items-center justify-center bg-media-placeholder">
                    <MediaThumb asset={asset} size="grid" />
                    <button
                      type="button"
                      onClick={() => void handleDelete(asset)}
                      disabled={deletingId === asset.publicId}
                      title="Delete image"
                      aria-label={`Delete ${asset.filename}`}
                      className="absolute right-2 top-2 rounded-md bg-white/90 p-1.5 text-muted shadow-sm opacity-0 transition hover:text-burgundy group-hover:opacity-100 disabled:opacity-60"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="truncate text-[0.88rem] font-medium text-admin-ink">
                      {asset.filename}
                    </p>
                    <AssetUrlRow url={asset.url} textClassName="text-[0.75rem] text-muted" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
              {visibleAssets.map((asset) => (
                <li
                  key={asset.publicId}
                  className="flex items-center gap-4 px-4 py-3 transition hover:bg-admin-bg/80"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-media-placeholder">
                    <MediaThumb asset={asset} size="list" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-admin-ink">{asset.filename}</p>
                    <AssetUrlRow url={asset.url} textClassName="text-[0.8rem] text-muted" />
                  </div>
                  <span className="hidden text-[0.8rem] text-muted sm:inline">
                    {asset.mimeType || '—'}
                  </span>
                  <span className="w-16 text-right text-[0.8rem] tabular-nums text-muted">
                    {formatBytes(asset.sizeBytes)}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleDelete(asset)}
                    disabled={deletingId === asset.publicId}
                    title="Delete image"
                    aria-label={`Delete ${asset.filename}`}
                    className="rounded-md p-1.5 text-muted transition hover:bg-admin-bg hover:text-burgundy disabled:opacity-60"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {pageCount > 1 ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.8rem] text-muted">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, assets.length)} of {assets.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-[0.82rem] font-medium text-admin-ink transition hover:bg-admin-bg disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-[0.82rem] tabular-nums text-muted">
                  {safePage} / {pageCount}
                </span>
                <button
                  type="button"
                  disabled={safePage >= pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-[0.82rem] font-medium text-admin-ink transition hover:bg-admin-bg disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

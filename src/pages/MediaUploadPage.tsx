import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { uploadMediaBatch } from '../api/media'
import { noticeLocationState } from '../components/NoticeBanner'
import { prepareMediaFile } from '../lib/prepareMediaFile'

const fieldClass =
  'w-full rounded-lg border border-border bg-white px-3 py-2.5 text-[0.9rem] text-admin-ink outline-none transition placeholder:text-muted-light focus:border-burgundy/40 focus:ring-2 focus:ring-burgundy/15'

const labelClass = 'text-[0.8rem] font-medium text-admin-ink'

type PendingMedia = {
  id: string
  file: File
  previewUrl: string
  converted: boolean
}

function newPendingId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function MediaUploadPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<PendingMedia[]>([])
  const [alt, setAlt] = useState('')
  const [error, setError] = useState('')
  const [preparing, setPreparing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const prepareRequest = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const itemsRef = useRef<PendingMedia[]>([])

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        URL.revokeObjectURL(item.previewUrl)
      }
    }
  }, [])

  function revokeItems(list: PendingMedia[]) {
    for (const item of list) URL.revokeObjectURL(item.previewUrl)
  }

  function clearSelection() {
    prepareRequest.current += 1
    setItems((prev) => {
      revokeItems(prev)
      return []
    })
    setPreparing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((item) => item.id !== id)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleFileChange(fileList: FileList | null) {
    const requestId = ++prepareRequest.current
    const selected = fileList ? Array.from(fileList) : []

    if (fileInputRef.current) fileInputRef.current.value = ''

    if (selected.length === 0) return

    setError('')
    setPreparing(true)

    const prepared: PendingMedia[] = []
    const failures: string[] = []

    try {
      for (const raw of selected) {
        if (requestId !== prepareRequest.current) {
          revokeItems(prepared)
          return
        }

        try {
          const result = await prepareMediaFile(raw)
          prepared.push({
            id: newPendingId(),
            file: result.file,
            previewUrl: URL.createObjectURL(result.file),
            converted: result.converted,
          })
        } catch (err) {
          failures.push(
            `${raw.name}: ${err instanceof Error ? err.message : 'Could not read this file.'}`,
          )
        }
      }

      if (requestId !== prepareRequest.current) {
        revokeItems(prepared)
        return
      }

      setItems((prev) => [...prev, ...prepared])
      if (failures.length > 0) {
        setError(
          failures.length === 1
            ? failures[0]
            : `${failures.length} files could not be prepared.\n${failures.join('\n')}`,
        )
      }
    } finally {
      if (requestId === prepareRequest.current) setPreparing(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (preparing) return

    if (items.length === 0) {
      setError('Choose at least one image or video to upload.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const result = await uploadMediaBatch(
        items.map((item) => item.file),
        alt,
      )

      const failedNames = new Set(result.failed.map((item) => item.filename))
      const remaining = items.filter((item) => failedNames.has(item.file.name))
      const succeeded = items.filter((item) => !failedNames.has(item.file.name))

      for (const item of succeeded) URL.revokeObjectURL(item.previewUrl)
      setItems(remaining)

      if (result.failed.length === 0) {
        navigate('/media', {
          replace: true,
          state: noticeLocationState(
            result.uploaded.length === 1
              ? 'Media uploaded.'
              : `${result.uploaded.length} media files uploaded.`,
          ),
        })
        return
      }

      const failedMessages = result.failed.map(
        (item) => `${item.filename}: ${item.message}`,
      )
      if (result.uploaded.length > 0) {
        setError(
          `${result.uploaded.length} uploaded, ${result.failed.length} failed. Retry the remaining files.\n${failedMessages.join('\n')}`,
        )
      } else {
        setError(
          failedMessages.length === 1
            ? failedMessages[0]
            : `All uploads failed.\n${failedMessages.join('\n')}`,
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const convertedCount = items.filter((item) => item.converted).length

  return (
    <div className="animate-fade-up px-6 py-6 lg:px-8">
      <div className="mb-6">
        <Link
          to="/media"
          className="text-[0.85rem] font-medium text-muted transition hover:text-burgundy"
        >
          ← Media
        </Link>
        <h1 className="mt-2 font-display text-[1.85rem] font-semibold text-admin-ink">
          Upload media
        </h1>
        <p className="mt-1 text-[0.88rem] text-muted">
          Upload one or more images or videos for products, categories, and trending
        </p>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        noValidate
        className="max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
      >
        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className={labelClass}>Files</span>
              {items.length > 0 ? (
                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={preparing || submitting}
                  className="text-[0.78rem] font-medium text-muted transition hover:text-burgundy disabled:opacity-50"
                >
                  Clear all
                </button>
              ) : null}
            </div>

            <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-admin-bg/50 px-4 py-10 transition hover:border-burgundy/30 hover:bg-accent-pink/40">
              <span className="text-[0.9rem] font-medium text-admin-ink">
                {items.length === 0
                  ? 'Choose images or videos'
                  : `Add more (${items.length} selected)`}
              </span>
              <span className="text-[0.78rem] text-muted">
                Images (JPG, PNG, WebP, GIF, iPhone HEIC) or video (MP4, WebM)
              </span>
              {preparing ? (
                <span className="text-[0.78rem] text-burgundy">Preparing files…</span>
              ) : null}
              {convertedCount > 0 ? (
                <span className="text-[0.78rem] text-muted">
                  {convertedCount === 1
                    ? '1 iPhone photo converted to JPG.'
                    : `${convertedCount} iPhone photos converted to JPG.`}
                </span>
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.heic,.heif,image/heic,image/heif"
                className="sr-only"
                disabled={preparing || submitting}
                onChange={(e) => void handleFileChange(e.target.files)}
              />
            </label>

            {items.length > 0 ? (
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="relative overflow-hidden rounded-xl border border-border/60 bg-admin-bg/40"
                  >
                    {item.file.type.startsWith('video/') ? (
                      <video
                        src={item.previewUrl}
                        muted
                        playsInline
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <img
                        src={item.previewUrl}
                        alt=""
                        className="aspect-square w-full object-cover"
                      />
                    )}
                    <div className="space-y-1 p-2">
                      <p className="truncate text-[0.72rem] font-medium text-admin-ink" title={item.file.name}>
                        {item.file.name}
                      </p>
                      {item.converted ? (
                        <p className="text-[0.68rem] text-muted">Converted to JPG</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={preparing || submitting}
                      className="absolute right-1.5 top-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[0.7rem] font-medium text-admin-ink shadow-sm transition hover:bg-white disabled:opacity-50"
                      aria-label={`Remove ${item.file.name}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Alt text</span>
            <input
              type="text"
              name="alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Rose kanjeevaram pavadai on ivory backdrop"
              className={fieldClass}
            />
            {items.length > 1 ? (
              <span className="text-[0.72rem] text-muted">
                Applied to every file in this upload. Leave blank to use each filename.
              </span>
            ) : null}
          </label>

          {error ? (
            <p className="whitespace-pre-wrap text-[0.85rem] text-burgundy-soft" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border/60 bg-admin-bg/40 px-5 py-4 sm:px-6">
          <Link
            to="/media"
            className="rounded-lg px-4 py-2.5 text-[0.88rem] font-medium text-muted transition hover:text-admin-ink"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || preparing || items.length === 0}
            className="rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark disabled:opacity-60"
          >
            {preparing
              ? 'Preparing…'
              : submitting
                ? items.length > 1
                  ? `Uploading ${items.length} files…`
                  : 'Uploading…'
                : items.length > 1
                  ? `Upload ${items.length} files`
                  : 'Upload'}
          </button>
        </div>
      </form>
    </div>
  )
}

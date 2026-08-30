import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createMediaAsset, type CreateMediaPayload } from '../api/media'

const fieldClass =
  'w-full rounded-lg border border-border bg-white px-3 py-2.5 text-[0.9rem] text-admin-ink outline-none transition placeholder:text-muted-light focus:border-burgundy/40 focus:ring-2 focus:ring-burgundy/15'

const labelClass = 'text-[0.8rem] font-medium text-admin-ink'

export function MediaUploadPage() {
  const navigate = useNavigate()
  const [filename, setFilename] = useState('')
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [mimeType, setMimeType] = useState('image/jpeg')
  const [fileLabel, setFileLabel] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleFileChange(file: File | null) {
    if (!file) {
      setFileLabel('')
      return
    }
    setFileLabel(file.name)
    if (!filename.trim()) setFilename(file.name)
    if (!url.trim()) setUrl(`/${file.name}`)
    if (file.type) setMimeType(file.type)
  }

  function buildPayload(): CreateMediaPayload | null {
    const trimmedFilename = filename.trim()
    const trimmedUrl = url.trim()

    if (!trimmedFilename) {
      setError('Filename is required.')
      return null
    }
    if (!trimmedUrl) {
      setError('URL / path is required.')
      return null
    }

    setError('')
    return {
      filename: trimmedFilename,
      url: trimmedUrl,
      alt: alt.trim(),
      mimeType: mimeType.trim() || 'application/octet-stream',
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = buildPayload()
    if (!payload) return

    setSubmitting(true)
    try {
      await createMediaAsset(payload)
      navigate('/media', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setSubmitting(false)
    }
  }

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
          Register an image for products, categories, and collections
        </p>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        noValidate
        className="max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
      >
        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <span className={labelClass}>File</span>
            <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-admin-bg/50 px-4 py-10 transition hover:border-burgundy/30 hover:bg-accent-pink/40">
              <span className="text-[0.9rem] font-medium text-admin-ink">
                {fileLabel || 'Choose an image'}
              </span>
              <span className="text-[0.78rem] text-muted">
                Local pick fills filename, path, and mime type — upload API comes later
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Filename</span>
            <input
              type="text"
              name="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="sunset.png"
              className={fieldClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>URL / path</span>
            <input
              type="text"
              name="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/sunset.png"
              className={fieldClass}
            />
            <span className="text-[0.75rem] text-muted-light">
              Storefront path or absolute URL (e.g. /sunset.png)
            </span>
          </label>

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
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>MIME type</span>
            <input
              type="text"
              name="mimeType"
              value={mimeType}
              onChange={(e) => setMimeType(e.target.value)}
              placeholder="image/jpeg"
              className={fieldClass}
            />
          </label>

          {error ? (
            <p className="text-[0.85rem] text-burgundy-soft" role="alert">
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
            disabled={submitting}
            className="rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Save media'}
          </button>
        </div>
      </form>
    </div>
  )
}

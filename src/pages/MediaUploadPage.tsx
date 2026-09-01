import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { uploadMediaImage } from '../api/media'
import { apiWriteKeyError } from '../lib/api'

const fieldClass =
  'w-full rounded-lg border border-border bg-white px-3 py-2.5 text-[0.9rem] text-admin-ink outline-none transition placeholder:text-muted-light focus:border-burgundy/40 focus:ring-2 focus:ring-burgundy/15'

const labelClass = 'text-[0.8rem] font-medium text-admin-ink'

export function MediaUploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const configError = apiWriteKeyError()

  function handleFileChange(next: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl)

    if (!next) {
      setFile(null)
      setPreviewUrl('')
      return
    }

    setFile(next)
    setPreviewUrl(URL.createObjectURL(next))
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (configError) {
      setError(configError)
      return
    }
    if (!file) {
      setError('Choose an image to upload.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await uploadMediaImage(file, alt)
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
          Upload an image for products, categories, and collections
        </p>
      </div>

      {configError ? (
        <div
          className="mb-5 max-w-2xl rounded-xl border border-burgundy/20 bg-accent-pink/50 px-4 py-3 text-[0.88rem] text-burgundy-soft"
          role="status"
        >
          {configError}. Add it to{' '}
          <code className="rounded bg-white/70 px-1 py-0.5 text-[0.8rem]">.env</code>, then
          restart the dev server.
        </div>
      ) : null}

      <form
        onSubmit={(e) => void handleSubmit(e)}
        noValidate
        className="max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
      >
        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <span className={labelClass}>File</span>
            <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-admin-bg/50 px-4 py-10 transition hover:border-burgundy/30 hover:bg-accent-pink/40">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt=""
                  className="max-h-48 rounded-lg object-contain"
                />
              ) : null}
              <span className="text-[0.9rem] font-medium text-admin-ink">
                {file?.name || 'Choose an image'}
              </span>
              <span className="text-[0.78rem] text-muted">
                JPG, PNG, WebP, or GIF — max 8 MB
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
            disabled={submitting || Boolean(configError)}
            className="rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark disabled:opacity-60"
          >
            {submitting ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>
    </div>
  )
}

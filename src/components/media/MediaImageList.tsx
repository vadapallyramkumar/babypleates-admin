import { useState } from 'react'
import { mediaThumbUrl } from '../../lib/mediaUrl'
import { IconClose, IconImage, IconPlus } from '../icons'
import { MediaPickerModal } from './MediaPickerModal'

type MediaImageListProps = {
  urls: string[]
  onChange: (urls: string[]) => void
  emptyLabel?: string
  addLabel?: string
}

export function MediaImageList({
  urls,
  onChange,
  emptyLabel = 'No images yet.',
  addLabel = 'Add from media',
}: MediaImageListProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null)

  const selectedUrl =
    replaceIndex !== null ? (urls[replaceIndex] ?? '') : ''

  function openAdd() {
    setReplaceIndex(null)
    setPickerOpen(true)
  }

  function openReplace(index: number) {
    setReplaceIndex(index)
    setPickerOpen(true)
  }

  function handleSelect(url: string) {
    if (replaceIndex !== null) {
      const next = [...urls]
      next[replaceIndex] = url
      onChange(next)
    } else if (!urls.includes(url)) {
      onChange([...urls, url])
    }
    setReplaceIndex(null)
  }

  return (
    <div>
      {urls.length === 0 ? (
        <button
          type="button"
          onClick={openAdd}
          className="flex w-full items-center gap-4 rounded-xl border border-dashed border-border bg-admin-bg/40 px-4 py-5 text-left transition hover:border-burgundy/40 hover:bg-accent-pink/30"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-card text-muted ring-1 ring-border/70">
            <IconImage className="h-6 w-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.95rem] font-medium text-admin-ink">
              Choose from media
            </span>
            <span className="mt-1 block text-[0.82rem] text-muted">{emptyLabel}</span>
          </span>
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {urls.map((url, index) => (
            <li key={`${url}-${index}`} className="group relative">
              <button
                type="button"
                onClick={() => openReplace(index)}
                title="Change image"
                className="block w-full overflow-hidden rounded-xl bg-media-placeholder ring-1 ring-border/80 transition hover:ring-burgundy/40"
              >
                <div className="aspect-square">
                  <img
                    src={mediaThumbUrl(url, 320)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>
              <button
                type="button"
                onClick={() => onChange(urls.filter((_, i) => i !== index))}
                className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-admin-ink/70 text-white opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-burgundy"
                title="Remove"
              >
                <IconClose className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </button>
            </li>
          ))}

          <li>
            <button
              type="button"
              onClick={openAdd}
              className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-admin-bg/40 text-muted transition hover:border-burgundy/40 hover:bg-accent-pink/30 hover:text-burgundy"
            >
              <IconPlus className="h-5 w-5" />
              <span className="px-2 text-center text-[0.78rem] font-medium">{addLabel}</span>
            </button>
          </li>
        </ul>
      )}

      <MediaPickerModal
        open={pickerOpen}
        selectedUrl={selectedUrl}
        onClose={() => {
          setPickerOpen(false)
          setReplaceIndex(null)
        }}
        onSelect={handleSelect}
      />
    </div>
  )
}

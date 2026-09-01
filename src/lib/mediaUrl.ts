/** Display-only resized URL — selection/clipboard still uses the original asset.url. */
export function mediaThumbUrl(url: string, width: number): string {
  if (!url) return url
  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('res.cloudinary.com')) {
      const marker = '/upload/'
      const index = parsed.pathname.indexOf(marker)
      if (index !== -1) {
        const before = parsed.pathname.slice(0, index + marker.length)
        const after = parsed.pathname.slice(index + marker.length)
        // Avoid stacking transforms if one is already present
        const hasTransform = after.includes('/') && /^(?:[a-z]+_)/.test(after.split('/')[0] ?? '')
        if (!hasTransform) {
          parsed.pathname = `${before}f_auto,q_auto,c_fill,w_${width}/${after}`
          return parsed.toString()
        }
      }
      return url
    }

    if (parsed.hostname.includes('images.unsplash.com')) {
      parsed.searchParams.set('auto', 'format')
      parsed.searchParams.set('fit', 'crop')
      parsed.searchParams.set('w', String(width))
      parsed.searchParams.set('q', '60')
      return parsed.toString()
    }
  } catch {
    // relative paths — leave as-is
  }
  return url
}

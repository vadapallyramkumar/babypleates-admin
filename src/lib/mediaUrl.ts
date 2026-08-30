/** Display-only resized URL — selection/clipboard still uses the original asset.url. */
export function mediaThumbUrl(url: string, width: number): string {
  if (!url) return url
  try {
    const parsed = new URL(url)
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

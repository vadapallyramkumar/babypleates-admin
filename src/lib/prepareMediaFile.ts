const HEIC_BRANDS = new Set(['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'])

function hasHeicName(file: File): boolean {
  const type = file.type.toLowerCase()
  if (
    type === 'image/heic' ||
    type === 'image/heif' ||
    type === 'image/heic-sequence' ||
    type === 'image/heif-sequence'
  ) {
    return true
  }
  return /\.(heic|heif)$/i.test(file.name)
}

/** True for real HEIC/HEIF bytes, including iPhone photos renamed to .jpg. */
export async function isHeicFile(file: Blob): Promise<boolean> {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  if (header.length < 12) return false
  const box = String.fromCharCode(header[4], header[5], header[6], header[7])
  if (box !== 'ftyp') return false
  const brand = String.fromCharCode(header[8], header[9], header[10], header[11]).toLowerCase()
  return HEIC_BRANDS.has(brand)
}

function jpegFileName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '') || 'photo'
  return `${base}.jpg`
}

async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    const { heicTo } = await import('heic-to')
    const blob = await heicTo({
      blob: file,
      type: 'image/jpeg',
      quality: 0.9,
    })
    return new File([blob], jpegFileName(file.name), {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    })
  } catch {
    throw new Error(
      'This iPhone HEIC photo could not be converted to JPG. Export it as JPEG from the Photos app and try again.',
    )
  }
}

/**
 * The media API rejects HEIC bytes. iPhone photos are converted to JPG first,
 * including files that still contain HEIC data under a .jpg name.
 */
export async function prepareMediaFile(file: File): Promise<{ file: File; converted: boolean }> {
  const heic = (await isHeicFile(file)) || hasHeicName(file)
  if (!heic) return { file, converted: false }
  return { file: await convertHeicToJpeg(file), converted: true }
}

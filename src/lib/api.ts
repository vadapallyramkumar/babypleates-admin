const DEFAULT_BASE = 'https://babypleats-api.onrender.com'

export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL?.trim()
  return (base || DEFAULT_BASE).replace(/\/$/, '')
}

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

function messageFromBody(parsed: unknown, status: number): string {
  if (typeof parsed === 'object' && parsed !== null) {
    const record = parsed as Record<string, unknown>
    if (typeof record.message === 'string') return record.message
    if (typeof record.error === 'string') return record.error
    if (record.error && typeof record.error === 'object') {
      const nested = record.error as Record<string, unknown>
      if (typeof nested.message === 'string') return nested.message
    }
  }
  return `Request failed (${status})`
}

function getWriteApiKey(): string {
  return import.meta.env.VITE_API_WRITE_KEY?.trim() ?? ''
}

function isWriteMethod(method?: string): boolean {
  const m = (method ?? 'GET').toUpperCase()
  return m !== 'GET' && m !== 'HEAD' && m !== 'OPTIONS'
}

export function apiWriteKeyError(): string | null {
  if (!getWriteApiKey()) {
    return 'Missing VITE_API_WRITE_KEY in .env (same value as API_WRITE_KEY on the API service)'
  }
  return null
}

async function parseResponse<T>(response: Response): Promise<T> {
  // DELETE/PUT soft-deletes often return 204/205 with an empty body.
  if (response.status === 204 || response.status === 205) {
    if (!response.ok) {
      throw new ApiError(`Request failed (${response.status})`, response.status, null)
    }
    return undefined as T
  }

  let text = ''
  try {
    text = await response.text()
  } catch {
    text = ''
  }

  let parsed: unknown = undefined
  if (text.trim()) {
    try {
      parsed = JSON.parse(text) as unknown
    } catch {
      parsed = text
    }
  }

  if (!response.ok) {
    throw new ApiError(messageFromBody(parsed, response.status), response.status, parsed)
  }

  // Successful responses with no body (e.g. DELETE 200) are still success.
  return parsed as T
}

/** Multipart upload (e.g. POST /v1/media/upload). Do not set Content-Type — the browser adds the boundary. */
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
  const writeKey = getWriteApiKey()

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(writeKey ? { Authorization: `Bearer ${writeKey}` } : {}),
    },
    body: formData,
  })

  return parseResponse<T>(response)
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
  const writeKey = getWriteApiKey()

  const response = await fetch(url, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(isWriteMethod(rest.method) && writeKey
        ? { Authorization: `Bearer ${writeKey}` }
        : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  return parseResponse<T>(response)
}

export function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

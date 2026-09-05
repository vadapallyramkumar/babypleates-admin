import { getAccessToken, signOut } from './auth'

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
  /** Skip Authorization header (e.g. login). */
  skipAuth?: boolean
  /** Do not redirect to /login on 401. */
  skipAuthRedirect?: boolean
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

function handleUnauthorized(path: string, skipAuthRedirect?: boolean) {
  if (skipAuthRedirect) return
  if (path.includes('/auth/login')) return
  signOut()
  if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
    const base = import.meta.env.BASE_URL || '/'
    const loginPath = `${base.replace(/\/$/, '')}/login`
    window.location.assign(loginPath)
  }
}

async function parseResponse<T>(
  response: Response,
  path: string,
  skipAuthRedirect?: boolean,
): Promise<T> {
  if (response.status === 401) {
    handleUnauthorized(path, skipAuthRedirect)
  }

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

  return parsed as T
}

function authHeaders(skipAuth?: boolean): Record<string, string> {
  if (skipAuth) return {}
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Multipart upload (e.g. POST /v1/media/upload). Do not set Content-Type — the browser adds the boundary. */
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...authHeaders(),
    },
    body: formData,
  })

  return parseResponse<T>(response, path)
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, skipAuth, skipAuthRedirect, ...rest } = options
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`

  const response = await fetch(url, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...authHeaders(skipAuth),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  return parseResponse<T>(response, path, skipAuthRedirect)
}

export function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

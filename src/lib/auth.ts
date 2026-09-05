export type AdminRole = 'owner' | 'staff'

export type AdminUser = {
  id: string
  email: string
  name: string
  role: AdminRole
}

const TOKEN_KEY = 'bp_admin_token'
const USER_KEY = 'bp_admin_user'
const REMEMBER_KEY = 'bp_admin_remember'

function storageFor(remember: boolean): Storage {
  return remember ? localStorage : sessionStorage
}

function readToken(): string | null {
  return (
    sessionStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(TOKEN_KEY) ||
    null
  )
}

function readUser(): AdminUser | null {
  const raw =
    sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AdminUser
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return Boolean(readToken())
}

export function getAccessToken(): string | null {
  return readToken()
}

export function getCurrentUser(): AdminUser | null {
  return readUser()
}

export function signIn(options: {
  token: string
  user: AdminUser
  remember: boolean
}): void {
  const { token, user, remember } = options
  signOut()
  const store = storageFor(remember)
  store.setItem(TOKEN_KEY, token)
  store.setItem(USER_KEY, JSON.stringify(user))
  if (remember) {
    localStorage.setItem(REMEMBER_KEY, '1')
  } else {
    localStorage.removeItem(REMEMBER_KEY)
  }
}

export function signOut(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getRememberPreference(): boolean {
  return localStorage.getItem(REMEMBER_KEY) === '1'
}

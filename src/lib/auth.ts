const AUTH_KEY = 'bp_admin_auth'
const REMEMBER_KEY = 'bp_admin_remember'

export function isAuthenticated(): boolean {
  return (
    sessionStorage.getItem(AUTH_KEY) === '1' ||
    localStorage.getItem(AUTH_KEY) === '1'
  )
}

export function signIn(remember: boolean): void {
  if (remember) {
    localStorage.setItem(AUTH_KEY, '1')
    localStorage.setItem(REMEMBER_KEY, '1')
    sessionStorage.removeItem(AUTH_KEY)
  } else {
    sessionStorage.setItem(AUTH_KEY, '1')
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(REMEMBER_KEY)
  }
}

export function signOut(): void {
  sessionStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(AUTH_KEY)
}

export function getRememberPreference(): boolean {
  return localStorage.getItem(REMEMBER_KEY) === '1'
}

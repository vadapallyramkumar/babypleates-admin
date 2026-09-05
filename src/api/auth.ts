import { apiRequest, unwrapData } from '../lib/api'
import type { AdminUser } from '../lib/auth'

export type LoginResult = {
  accessToken: string
  expiresIn: number
  user: AdminUser
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const payload = await apiRequest<{ data: LoginResult }>('/v1/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
    skipAuthRedirect: true,
  })
  return unwrapData<LoginResult>(payload)
}

export async function logout(): Promise<void> {
  await apiRequest<void>('/v1/auth/logout', {
    method: 'POST',
    skipAuthRedirect: true,
  })
}

export async function fetchMe(): Promise<AdminUser> {
  const payload = await apiRequest<{ data: AdminUser }>('/v1/auth/me')
  return unwrapData<AdminUser>(payload)
}

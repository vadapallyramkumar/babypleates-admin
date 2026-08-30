import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRememberPreference, signIn } from '../../lib/auth'
import {
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconShield,
} from '../icons'

export function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(getRememberPreference)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    signIn(remember)
    navigate('/', { replace: true })
  }

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center bg-surface px-5 py-8 sm:px-8 lg:rounded-r-[1.75rem] lg:rounded-l-none">
      <div className="w-full max-w-[22.5rem] animate-fade-up">
        <div className="relative rounded-2xl bg-card px-6 py-7 shadow-[0_12px_40px_rgba(92,26,46,0.08)] sm:px-8 sm:py-8">
          <div className="absolute top-5 right-5 flex items-center gap-1.5 rounded-full bg-live-bg px-2.5 py-1 text-[0.7rem] font-medium text-live">
            <span className="h-1.5 w-1.5 rounded-full bg-live-dot" />
            Store is Live
          </div>

          <header className="pr-24">
            <h2 className="font-display text-[1.85rem] font-semibold leading-tight text-burgundy sm:text-[2rem]">
              Welcome back!
            </h2>
            <p className="mt-1.5 text-[0.85rem] text-muted">
              Sign in to your BabyPleates admin account
            </p>
          </header>

          <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <label className="flex flex-col gap-1.5">
              <span className="text-[0.8rem] font-medium text-burgundy">Email address</span>
              <span className="relative flex items-center">
                <IconMail className="pointer-events-none absolute left-3 h-4 w-4 text-muted-light" />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="admin@babypleates.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white py-2.5 pr-3 pl-10 text-[0.9rem] text-burgundy outline-none transition placeholder:text-muted-light focus:border-burgundy/40 focus:ring-2 focus:ring-burgundy/15"
                />
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[0.8rem] font-medium text-burgundy">Password</span>
              <span className="relative flex items-center">
                <IconLock className="pointer-events-none absolute left-3 h-4 w-4 text-muted-light" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white py-2.5 pr-20 pl-10 text-[0.9rem] text-burgundy outline-none transition placeholder:text-muted-light focus:border-burgundy/40 focus:ring-2 focus:ring-burgundy/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 flex items-center gap-1 rounded-md px-1.5 py-1 text-[0.75rem] font-medium text-muted transition hover:text-burgundy"
                >
                  {showPassword ? (
                    <IconEyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <IconEye className="h-3.5 w-3.5" />
                  )}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </label>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex cursor-pointer items-center gap-2 text-[0.8rem] text-burgundy">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 accent-burgundy"
                />
                Remember me
              </label>
              <a
                href="#forgot"
                className="text-[0.8rem] font-medium text-burgundy transition hover:text-burgundy-soft"
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </a>
            </div>

            {error ? (
              <p className="text-[0.8rem] text-burgundy-soft" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-burgundy py-3 text-[0.92rem] font-semibold text-white shadow-sm transition hover:bg-burgundy-dark hover:shadow-md active:scale-[0.99]"
            >
              <IconLock className="h-4 w-4" />
              Sign in to Admin
            </button>
          </form>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-[0.72rem] text-muted-light">
          <IconShield className="h-3.5 w-3.5" />
          Secure admin access. All rights reserved.
        </p>
      </div>
    </div>
  )
}

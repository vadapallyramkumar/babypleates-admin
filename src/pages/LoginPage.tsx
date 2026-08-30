import { BrandPanel } from '../components/login/BrandPanel'
import { LoginForm } from '../components/login/LoginForm'

export function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#ebe7e3] p-4 sm:p-6 lg:p-8">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[1.75rem] bg-card shadow-[0_24px_60px_rgba(92,26,46,0.12)] lg:min-h-[640px] lg:flex-row">
        <BrandPanel />
        <LoginForm />
      </div>
    </main>
  )
}

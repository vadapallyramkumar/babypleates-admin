import type { ReactNode } from 'react'

export function StatusBadge({ status }: { status: string }) {
  const isLow = status.toLowerCase().includes('low')
  return (
    <span className={isLow ? 'font-medium text-warning' : 'font-medium text-success'}>
      {status}
    </span>
  )
}

export function StatCard({
  label,
  value,
  note,
  noteTone = 'success',
}: {
  label: string
  value: string | number
  note: string
  noteTone?: 'success' | 'warning'
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-5 py-4 shadow-sm">
      <p className="text-[0.8rem] text-muted">{label}</p>
      <p className="mt-1 text-[1.75rem] font-semibold tracking-tight text-admin-ink">{value}</p>
      <p
        className={`mt-1 text-[0.78rem] ${
          noteTone === 'warning' ? 'text-warning' : 'text-success'
        }`}
      >
        {note}
      </p>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
  meta,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  meta?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-admin-ink">{title}</h1>
        {subtitle ? <p className="mt-1 text-[0.9rem] text-muted">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-4">
        {meta}
        {action}
      </div>
    </div>
  )
}

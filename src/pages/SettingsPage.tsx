import { PageHeader } from '../components/admin/ui'

export function SettingsPage() {
  return (
    <div className="animate-fade-up px-8 py-8 lg:px-10">
      <PageHeader
        title="Settings"
        subtitle="Store preferences, policies and account options"
      />
      <div className="mt-8 max-w-xl rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm">
        <p className="text-[1.05rem] font-semibold text-admin-ink">Settings coming soon</p>
        <p className="mt-2 text-[0.9rem] text-muted">
          Store configuration screens will live here once the Figma mocks are ready.
        </p>
      </div>
    </div>
  )
}

import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/admin/ui'
import { DeliveryHolidaysPanel } from '../components/delivery/DeliveryHolidaysPanel'
import { DeliveryRegionsPanel } from '../components/delivery/DeliveryRegionsPanel'
import { DeliverySettingsPanel } from '../components/delivery/DeliverySettingsPanel'
import { IconTruck } from '../components/icons'
import { NoticeBanner } from '../components/NoticeBanner'
import { useNotice } from '../hooks/useNotice'

const TABS = [
  { id: 'settings', label: 'General Settings' },
  { id: 'regions', label: 'Delivery Regions' },
  { id: 'holidays', label: 'Holidays' },
] as const

type DeliveryTab = (typeof TABS)[number]['id']

function parseTab(value: string | null): DeliveryTab {
  if (value === 'regions' || value === 'holidays' || value === 'settings') return value
  return 'settings'
}

export function DeliveryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = parseTab(searchParams.get('tab'))
  const { notice, showSuccess, showError, dismiss } = useNotice()

  function setTab(next: DeliveryTab) {
    setSearchParams(next === 'settings' ? {} : { tab: next }, { replace: true })
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <PageHeader
        title="Delivery Management"
        subtitle="Configure preparation times, regional courier transit, and non-working holidays"
        meta={
          <span className="hidden items-center gap-2 text-[0.82rem] text-muted sm:inline-flex">
            <IconTruck className="h-4 w-4" />
            Manual courier dispatch
          </span>
        }
      />

      {notice ? <NoticeBanner notice={notice} onDismiss={dismiss} /> : null}

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border/50 pb-px">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={[
              '-mb-px border-b-2 px-3 py-2.5 text-[0.88rem] font-medium transition',
              tab === item.id
                ? 'border-burgundy text-burgundy'
                : 'border-transparent text-muted hover:text-admin-ink',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'settings' ? (
        <DeliverySettingsPanel onSuccess={showSuccess} onError={showError} />
      ) : null}
      {tab === 'regions' ? (
        <DeliveryRegionsPanel onSuccess={showSuccess} onError={showError} />
      ) : null}
      {tab === 'holidays' ? (
        <DeliveryHolidaysPanel onSuccess={showSuccess} onError={showError} />
      ) : null}
    </div>
  )
}

import { useEffect, useState, type FormEvent } from 'react'
import {
  DEFAULT_DELIVERY_SETTINGS,
  WEEKDAY_LABELS,
  fetchDeliverySettings,
  isValidCutoffTime,
  updateDeliverySettings,
  type DeliverySettings,
  type Weekday,
} from '../../api/delivery'
import { ApiError } from '../../lib/api'
import { homeFieldClass, homeLabelClass } from '../home/homeUi'

type DeliverySettingsPanelProps = {
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function DeliverySettingsPanel({ onSuccess, onError }: DeliverySettingsPanelProps) {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [minPreparationDays, setMinPreparationDays] = useState(
    String(DEFAULT_DELIVERY_SETTINGS.minPreparationDays),
  )
  const [maxPreparationDays, setMaxPreparationDays] = useState(
    String(DEFAULT_DELIVERY_SETTINGS.maxPreparationDays),
  )
  const [minCourierTransitDays, setMinCourierTransitDays] = useState(
    String(DEFAULT_DELIVERY_SETTINGS.minCourierTransitDays),
  )
  const [maxCourierTransitDays, setMaxCourierTransitDays] = useState(
    String(DEFAULT_DELIVERY_SETTINGS.maxCourierTransitDays),
  )
  const [dailyOrderCutoff, setDailyOrderCutoff] = useState(
    DEFAULT_DELIVERY_SETTINGS.dailyOrderCutoff,
  )
  const [timezone, setTimezone] = useState(DEFAULT_DELIVERY_SETTINGS.timezone)
  const [workingDays, setWorkingDays] = useState<Weekday[]>([
    ...DEFAULT_DELIVERY_SETTINGS.workingDays,
  ])
  const [deliveryEstimatesEnabled, setDeliveryEstimatesEnabled] = useState(
    DEFAULT_DELIVERY_SETTINGS.deliveryEstimatesEnabled,
  )

  function applySettings(settings: DeliverySettings) {
    setMinPreparationDays(String(settings.minPreparationDays))
    setMaxPreparationDays(String(settings.maxPreparationDays))
    setMinCourierTransitDays(String(settings.minCourierTransitDays))
    setMaxCourierTransitDays(String(settings.maxCourierTransitDays))
    setDailyOrderCutoff(settings.dailyOrderCutoff)
    setTimezone(settings.timezone)
    setWorkingDays([...settings.workingDays])
    setDeliveryEstimatesEnabled(settings.deliveryEstimatesEnabled)
  }

  async function load() {
    setLoading(true)
    setLoadError('')
    try {
      applySettings(await fetchDeliverySettings())
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load delivery settings.'
      setLoadError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function toggleWorkingDay(day: Weekday) {
    setWorkingDays((prev) => {
      if (prev.includes(day)) return prev.filter((d) => d !== day)
      return [...prev, day].sort((a, b) => {
        const order = (n: Weekday) => (n === 0 ? 7 : n)
        return order(a) - order(b)
      })
    })
  }

  function buildPayload(): DeliverySettings | null {
    const minPrep = Number(minPreparationDays)
    const maxPrep = Number(maxPreparationDays)
    const minTransit = Number(minCourierTransitDays)
    const maxTransit = Number(maxCourierTransitDays)
    const cutoff = dailyOrderCutoff.trim()
    const tz = timezone.trim()

    if (!Number.isInteger(minPrep) || minPrep < 0) {
      setFormError('Minimum preparation time must be a whole number of 0 or more.')
      return null
    }
    if (!Number.isInteger(maxPrep) || maxPrep < 0) {
      setFormError('Maximum preparation time must be a whole number of 0 or more.')
      return null
    }
    if (minPrep > maxPrep) {
      setFormError('Minimum preparation time cannot exceed maximum preparation time.')
      return null
    }
    if (!Number.isInteger(minTransit) || minTransit < 0) {
      setFormError('Minimum courier transit time must be a whole number of 0 or more.')
      return null
    }
    if (!Number.isInteger(maxTransit) || maxTransit < 0) {
      setFormError('Maximum courier transit time must be a whole number of 0 or more.')
      return null
    }
    if (minTransit > maxTransit) {
      setFormError('Minimum courier transit time cannot exceed maximum courier transit time.')
      return null
    }
    if (!isValidCutoffTime(cutoff)) {
      setFormError('Daily order cutoff must be a valid 24-hour time (HH:mm), e.g. 14:00.')
      return null
    }
    if (!tz) {
      setFormError('Timezone is required.')
      return null
    }
    if (workingDays.length === 0) {
      setFormError('Select at least one working day.')
      return null
    }

    setFormError('')
    return {
      minPreparationDays: minPrep,
      maxPreparationDays: maxPrep,
      minCourierTransitDays: minTransit,
      maxCourierTransitDays: maxTransit,
      dailyOrderCutoff: cutoff,
      timezone: tz,
      workingDays,
      deliveryEstimatesEnabled,
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = buildPayload()
    if (!payload) return

    setSaving(true)
    setFormError('')
    try {
      applySettings(await updateDeliverySettings(payload))
      onSuccess('Delivery settings saved.')
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to save delivery settings.'
      setFormError(message)
      onError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-border/40" />
        ))}
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="mt-6 rounded-xl border border-burgundy/20 bg-attention-bg px-4 py-5">
        <p className="text-[0.9rem] text-burgundy-soft" role="alert">
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-3 text-[0.85rem] font-semibold text-burgundy transition hover:text-burgundy-dark"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-5">
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <h2 className="text-[1.05rem] font-semibold text-admin-ink">How estimates work</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.88rem] text-muted">
          <li>
            Preparation and courier transit are counted separately in business days.
          </li>
          <li>
            Orders placed after the daily cutoff ({dailyOrderCutoff || '14:00'} {timezone || 'Asia/Kolkata'})
            start preparation on the next working day.
          </li>
          <li>
            Non-working weekdays and configured holidays are excluded from both preparation and
            transit counts.
          </li>
          <li>
            Regional PIN prefixes can override the default courier transit range. The storefront
            estimate is calculated by the backend from these settings.
          </li>
        </ul>
      </div>

      {formError ? (
        <p className="text-[0.9rem] text-burgundy-soft" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <h2 className="text-[1.05rem] font-semibold text-admin-ink">Preparation time</h2>
        <p className="mt-1 text-[0.85rem] text-muted">
          Business days to prepare an order before it leaves for courier dispatch.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={homeLabelClass}>Minimum (business days)</span>
            <input
              className={`${homeFieldClass} mt-1.5`}
              inputMode="numeric"
              type="number"
              value={minPreparationDays}
              onChange={(e) => setMinPreparationDays(e.target.value)}
            />
          </label>
          <label className="block">
            <span className={homeLabelClass}>Maximum (business days)</span>
            <input
              className={`${homeFieldClass} mt-1.5`}
              inputMode="numeric"
              type="number"
              value={maxPreparationDays}
              onChange={(e) => setMaxPreparationDays(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <h2 className="text-[1.05rem] font-semibold text-admin-ink">Courier transit time</h2>
        <p className="mt-1 text-[0.85rem] text-muted">
          Default business days in transit after dispatch. Region rules can override this per PIN.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={homeLabelClass}>Minimum (business days)</span>
            <input
              className={`${homeFieldClass} mt-1.5`}
              inputMode="numeric"
              type="number"
              value={minCourierTransitDays}
              onChange={(e) => setMinCourierTransitDays(e.target.value)}
            />
          </label>
          <label className="block">
            <span className={homeLabelClass}>Maximum (business days)</span>
            <input
              className={`${homeFieldClass} mt-1.5`}
              inputMode="numeric"
              type="number"
              value={maxCourierTransitDays}
              onChange={(e) => setMaxCourierTransitDays(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <h2 className="text-[1.05rem] font-semibold text-admin-ink">Cutoff &amp; calendar</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={homeLabelClass}>Daily order cutoff</span>
            <input
              type="time"
              className={`${homeFieldClass} mt-1.5`}
              value={dailyOrderCutoff}
              onChange={(e) => setDailyOrderCutoff(e.target.value)}
            />
          </label>
          <label className="block">
            <span className={homeLabelClass}>Timezone</span>
            <input
              className={`${homeFieldClass} mt-1.5`}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Asia/Kolkata"
              disabled={true}
            />
          </label>
        </div>

        <fieldset className="mt-5">
          <legend className={homeLabelClass}>Working days</legend>
          <p className="mt-1 text-[0.82rem] text-muted">
            Unchecked days (typically Sunday) do not count toward preparation or transit.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {WEEKDAY_LABELS.map((day) => {
              const checked = workingDays.includes(day.value)
              return (
                <label
                  key={day.value}
                  className={[
                    'inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[0.85rem] transition',
                    checked
                      ? 'bg-burgundy text-white'
                      : 'bg-admin-bg text-muted ring-1 ring-border/60 hover:text-admin-ink',
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggleWorkingDay(day.value)}
                  />
                  {day.label}
                </label>
              )
            })}
          </div>
        </fieldset>

        <label className="mt-5 flex items-center gap-2 text-[0.9rem] text-admin-ink">
          <input
            type="checkbox"
            checked={deliveryEstimatesEnabled}
            onChange={(e) => setDeliveryEstimatesEnabled(e.target.checked)}
          />
          Delivery estimates enabled for customers
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}

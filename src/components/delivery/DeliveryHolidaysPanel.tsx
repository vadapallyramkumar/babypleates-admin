import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  createDeliveryHoliday,
  deleteDeliveryHoliday,
  fetchDeliveryHolidays,
  formatHolidayDate,
  updateDeliveryHoliday,
  type DeliveryHoliday,
  type DeliveryHolidayWritePayload,
} from '../../api/delivery'
import { ApiError } from '../../lib/api'
import { homeFieldClass, homeLabelClass } from '../home/homeUi'
import { IconPencil, IconPlus, IconTrash } from '../icons'
import { DeliveryFormModal } from './DeliveryFormModal'

type DeliveryHolidaysPanelProps = {
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

type HolidayFormState = {
  date: string
  name: string
}

const EMPTY_FORM: HolidayFormState = {
  date: '',
  name: '',
}

function todayIsoDate() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function DeliveryHolidaysPanel({ onSuccess, onError }: DeliveryHolidaysPanelProps) {
  const [holidays, setHolidays] = useState<DeliveryHoliday[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<DeliveryHoliday | null>(null)
  const [form, setForm] = useState<HolidayFormState>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  async function load(opts?: { silent?: boolean }) {
    if (!opts?.silent) {
      setLoading(true)
      setLoadError('')
    }
    try {
      const list = await fetchDeliveryHolidays()
      setHolidays(
        [...list].sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name)),
      )
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load delivery holidays.'
      if (opts?.silent) onError(message)
      else {
        setLoadError(message)
        setHolidays([])
      }
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const today = todayIsoDate()
  const upcoming = useMemo(
    () => holidays.filter((h) => h.date >= today),
    [holidays, today],
  )
  const past = useMemo(
    () => holidays.filter((h) => h.date < today),
    [holidays, today],
  )

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(holiday: DeliveryHoliday) {
    setEditing(holiday)
    setForm({ date: holiday.date, name: holiday.name })
    setFormError('')
    setModalOpen(true)
  }

  function closeModal() {
    if (saving) return
    setModalOpen(false)
    setEditing(null)
    setFormError('')
  }

  function buildPayload(): DeliveryHolidayWritePayload | null {
    const date = form.date.trim()
    const name = form.name.trim()

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setFormError('Choose a valid holiday date.')
      return null
    }
    if (!name) {
      setFormError('Holiday name or description is required.')
      return null
    }

    const duplicate = holidays.find(
      (h) => h.date === date && h.id !== editing?.id,
    )
    if (duplicate) {
      setFormError(`A holiday already exists on ${formatHolidayDate(date)}.`)
      return null
    }

    setFormError('')
    return { date, name }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = buildPayload()
    if (!payload) return

    setSaving(true)
    setFormError('')
    try {
      if (editing) {
        await updateDeliveryHoliday(editing.id, payload)
        onSuccess(`“${payload.name}” updated.`)
      } else {
        await createDeliveryHoliday(payload)
        onSuccess(`“${payload.name}” added.`)
      }
      setModalOpen(false)
      setEditing(null)
      await load({ silent: true })
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to save holiday.'
      // If PATCH is unsupported, surface a clear message for edits.
      if (
        editing &&
        err instanceof ApiError &&
        (err.status === 404 || err.status === 405)
      ) {
        const tip =
          'Holiday updates may not be supported by the API yet. Delete and re-add instead.'
        setFormError(`${message} ${tip}`)
        onError(tip)
      } else {
        setFormError(message)
        onError(message)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(holiday: DeliveryHoliday) {
    const ok = window.confirm(
      `Delete holiday “${holiday.name}” on ${formatHolidayDate(holiday.date)}?`,
    )
    if (!ok) return
    setDeletingId(holiday.id)
    try {
      await deleteDeliveryHoliday(holiday.id)
      onSuccess(`“${holiday.name}” deleted.`)
      await load({ silent: true })
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Failed to delete holiday.')
    } finally {
      setDeletingId(null)
    }
  }

  function renderTable(items: DeliveryHoliday[], emptyLabel: string) {
    if (items.length === 0) {
      return <p className="mt-4 text-[0.88rem] text-muted">{emptyLabel}</p>
    }

    return (
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
        <table className="w-full min-w-[480px] text-left text-[0.88rem]">
          <thead>
            <tr className="border-b border-border/60 text-[0.75rem] tracking-wide text-muted uppercase">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Holiday</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((holiday) => (
              <tr key={holiday.id} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3.5 tabular-nums text-admin-ink">
                  {formatHolidayDate(holiday.date)}
                </td>
                <td className="px-4 py-3.5 text-admin-ink">{holiday.name}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      title="Edit holiday"
                      aria-label={`Edit ${holiday.name}`}
                      onClick={() => openEdit(holiday)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-admin-bg hover:text-admin-ink"
                    >
                      <IconPencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Delete holiday"
                      aria-label={`Delete ${holiday.name}`}
                      disabled={deletingId === holiday.id}
                      onClick={() => void handleDelete(holiday)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-attention-bg hover:text-burgundy disabled:opacity-40"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.05rem] font-semibold text-admin-ink">Holidays</h2>
          <p className="mt-1 max-w-2xl text-[0.88rem] text-muted">
            Configured holidays are excluded from delivery estimate calculations. Sundays are
            already treated as non-working when Sunday is unchecked in General Settings.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark"
        >
          <IconPlus className="h-4 w-4" />
          Add holiday
        </button>
      </div>

      {loadError ? (
        <div className="mt-4 rounded-xl border border-burgundy/20 bg-attention-bg px-4 py-4">
          <p className="text-[0.9rem] text-burgundy-soft" role="alert">
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-2 text-[0.85rem] font-semibold text-burgundy"
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <ul className="mt-5 space-y-2.5">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="h-14 animate-pulse rounded-xl bg-border/40" />
          ))}
        </ul>
      ) : (
        <>
          <section className="mt-6">
            <h3 className="text-[0.9rem] font-semibold text-admin-ink">
              Upcoming ({upcoming.length})
            </h3>
            {renderTable(upcoming, 'No upcoming holidays.')}
          </section>

          {past.length > 0 ? (
            <section className="mt-8">
              <h3 className="text-[0.9rem] font-semibold text-admin-ink">
                Past ({past.length})
              </h3>
              {renderTable(past, 'No past holidays.')}
            </section>
          ) : null}
        </>
      )}

      <DeliveryFormModal
        open={modalOpen}
        title={editing ? 'Edit holiday' : 'Add holiday'}
        subtitle="Holiday dates do not count as working days for estimates."
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError ? (
            <p className="text-[0.9rem] text-burgundy-soft" role="alert">
              {formError}
            </p>
          ) : null}

          <label className="block">
            <span className={homeLabelClass}>Date</span>
            <input
              type="date"
              className={`${homeFieldClass} mt-1.5`}
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            />
          </label>

          <label className="block">
            <span className={homeLabelClass}>Name / description</span>
            <input
              className={`${homeFieldClass} mt-1.5`}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Republic Day"
            />
          </label>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark disabled:opacity-50"
            >
              {saving ? 'Saving…' : editing ? 'Save holiday' : 'Add holiday'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={closeModal}
              className="rounded-lg px-4 py-2.5 text-[0.88rem] font-medium text-muted transition hover:text-admin-ink disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </DeliveryFormModal>
    </div>
  )
}

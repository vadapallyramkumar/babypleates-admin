import { useEffect, useState, type FormEvent } from 'react'
import {
  createDeliveryRegion,
  deleteDeliveryRegion,
  fetchDeliveryRegions,
  parsePinPrefixes,
  updateDeliveryRegion,
  type DeliveryRegion,
  type DeliveryRegionWritePayload,
} from '../../api/delivery'
import { ApiError } from '../../lib/api'
import { homeFieldClass, homeLabelClass } from '../home/homeUi'
import { IconPencil, IconPlus, IconTrash } from '../icons'
import { StatusBadge } from '../admin/ui'
import { DeliveryFormModal } from './DeliveryFormModal'

type DeliveryRegionsPanelProps = {
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

type RegionFormState = {
  name: string
  pinPrefixesRaw: string
  minTransitDays: string
  maxTransitDays: string
  isActive: boolean
  isDefault: boolean
}

const EMPTY_FORM: RegionFormState = {
  name: '',
  pinPrefixesRaw: '',
  minTransitDays: '3',
  maxTransitDays: '6',
  isActive: true,
  isDefault: false,
}

function formFromRegion(region: DeliveryRegion): RegionFormState {
  return {
    name: region.name,
    pinPrefixesRaw: region.pinPrefixes.join(', '),
    minTransitDays: String(region.minTransitDays),
    maxTransitDays: String(region.maxTransitDays),
    isActive: region.isActive,
    isDefault: region.isDefault,
  }
}

export function DeliveryRegionsPanel({ onSuccess, onError }: DeliveryRegionsPanelProps) {
  const [regions, setRegions] = useState<DeliveryRegion[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<DeliveryRegion | null>(null)
  const [form, setForm] = useState<RegionFormState>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  async function load(opts?: { silent?: boolean }) {
    if (!opts?.silent) {
      setLoading(true)
      setLoadError('')
    }
    try {
      setRegions(await fetchDeliveryRegions())
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load delivery regions.'
      if (opts?.silent) onError(message)
      else {
        setLoadError(message)
        setRegions([])
      }
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(region: DeliveryRegion) {
    setEditing(region)
    setForm(formFromRegion(region))
    setFormError('')
    setModalOpen(true)
  }

  function closeModal() {
    if (saving) return
    setModalOpen(false)
    setEditing(null)
    setFormError('')
  }

  function buildPayload(): DeliveryRegionWritePayload | null {
    const name = form.name.trim()
    if (!name) {
      setFormError('Region name is required.')
      return null
    }

    const minTransit = Number(form.minTransitDays)
    const maxTransit = Number(form.maxTransitDays)
    if (!Number.isInteger(minTransit) || minTransit < 0) {
      setFormError('Minimum transit days must be a whole number of 0 or more.')
      return null
    }
    if (!Number.isInteger(maxTransit) || maxTransit < 0) {
      setFormError('Maximum transit days must be a whole number of 0 or more.')
      return null
    }
    if (minTransit > maxTransit) {
      setFormError('Minimum transit days cannot exceed maximum transit days.')
      return null
    }

    let pinPrefixes: string[] = []
    if (form.isDefault) {
      pinPrefixes = []
    } else {
      const parsed = parsePinPrefixes(form.pinPrefixesRaw)
      if (parsed.error) {
        setFormError(parsed.error)
        return null
      }
      if (parsed.prefixes.length === 0) {
        setFormError('Add at least one PIN code prefix, or mark this as the default fallback region.')
        return null
      }
      pinPrefixes = parsed.prefixes
    }

    setFormError('')
    return {
      name,
      pinPrefixes,
      minTransitDays: minTransit,
      maxTransitDays: maxTransit,
      isActive: form.isActive,
      isDefault: form.isDefault,
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = buildPayload()
    if (!payload) return

    setSaving(true)
    setFormError('')
    try {
      if (editing) {
        await updateDeliveryRegion(editing.id, payload)
        onSuccess(`“${payload.name}” updated.`)
      } else {
        await createDeliveryRegion(payload)
        onSuccess(`“${payload.name}” created.`)
      }
      setModalOpen(false)
      setEditing(null)
      await load({ silent: true })
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to save delivery region.'
      setFormError(message)
      onError(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(region: DeliveryRegion) {
    const ok = window.confirm(`Delete region “${region.name}”? This cannot be undone.`)
    if (!ok) return
    setDeletingId(region.id)
    try {
      await deleteDeliveryRegion(region.id)
      onSuccess(`“${region.name}” deleted.`)
      await load({ silent: true })
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Failed to delete region.')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleToggleActive(region: DeliveryRegion) {
    setTogglingId(region.id)
    try {
      await updateDeliveryRegion(region.id, { isActive: !region.isActive })
      onSuccess(
        `“${region.name}” marked ${region.isActive ? 'inactive' : 'active'}.`,
      )
      await load({ silent: true })
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Failed to update region status.')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.05rem] font-semibold text-admin-ink">Delivery regions</h2>
          <p className="mt-1 max-w-2xl text-[0.88rem] text-muted">
            Configure courier transit ranges by PIN prefix. Overlapping prefixes are allowed —
            the backend uses the longest matching prefix. One default fallback region covers
            unmatched PIN codes.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark"
        >
          <IconPlus className="h-4 w-4" />
          Add region
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
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="h-16 animate-pulse rounded-xl bg-border/40" />
          ))}
        </ul>
      ) : regions.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">No delivery regions yet.</p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
          <table className="w-full min-w-[640px] text-left text-[0.88rem]">
            <thead>
              <tr className="border-b border-border/60 text-[0.75rem] tracking-wide text-muted uppercase">
                <th className="px-4 py-3 font-medium">Region</th>
                <th className="px-4 py-3 font-medium">PIN prefixes</th>
                <th className="px-4 py-3 font-medium">Transit</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((region) => (
                <tr key={region.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-admin-ink">{region.name}</p>
                    {region.isDefault ? (
                      <p className="mt-0.5 text-[0.78rem] text-muted">Default fallback</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 text-muted">
                    {region.isDefault
                      ? 'All unmatched PINs'
                      : region.pinPrefixes.join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-admin-ink">
                    {region.minTransitDays}–{region.maxTransitDays} days
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={region.isActive ? 'Active' : 'Inactive'} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => void handleToggleActive(region)}
                        disabled={togglingId === region.id}
                        className="rounded-lg px-2.5 py-1.5 text-[0.78rem] font-medium text-muted transition hover:bg-admin-bg hover:text-admin-ink disabled:opacity-40"
                      >
                        {region.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        type="button"
                        title="Edit region"
                        aria-label={`Edit ${region.name}`}
                        onClick={() => openEdit(region)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-admin-bg hover:text-admin-ink"
                      >
                        <IconPencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Delete region"
                        aria-label={`Delete ${region.name}`}
                        disabled={deletingId === region.id}
                        onClick={() => void handleDelete(region)}
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
      )}

      <DeliveryFormModal
        open={modalOpen}
        title={editing ? 'Edit region' : 'Add region'}
        subtitle="PIN prefixes are matched by the backend using the longest match."
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError ? (
            <p className="text-[0.9rem] text-burgundy-soft" role="alert">
              {formError}
            </p>
          ) : null}

          <label className="block">
            <span className={homeLabelClass}>Region name</span>
            <input
              className={`${homeFieldClass} mt-1.5`}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Hyderabad"
            />
          </label>

          <label className="flex items-center gap-2 text-[0.9rem] text-admin-ink">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  isDefault: e.target.checked,
                  pinPrefixesRaw: e.target.checked ? '' : prev.pinPrefixesRaw,
                }))
              }
            />
            Default fallback for unmatched PIN codes
          </label>

          {!form.isDefault ? (
            <label className="block">
              <span className={homeLabelClass}>PIN code prefixes</span>
              <input
                className={`${homeFieldClass} mt-1.5`}
                value={form.pinPrefixesRaw}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, pinPrefixesRaw: e.target.value }))
                }
                placeholder="500, 501, 502"
              />
              <span className="mt-1.5 block text-[0.78rem] text-muted">
                Comma-separated numeric prefixes only. Duplicates within a region are not allowed.
              </span>
            </label>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={homeLabelClass}>Min transit days</span>
              <input
                className={`${homeFieldClass} mt-1.5`}
                inputMode="numeric"
                type="number"
                value={form.minTransitDays}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, minTransitDays: e.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className={homeLabelClass}>Max transit days</span>
              <input
                className={`${homeFieldClass} mt-1.5`}
                inputMode="numeric"
                type="number"
                value={form.maxTransitDays}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, maxTransitDays: e.target.value }))
                }
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-[0.9rem] text-admin-ink">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            Active
          </label>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark disabled:opacity-50"
            >
              {saving ? 'Saving…' : editing ? 'Save region' : 'Create region'}
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

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteCategory, fetchCategories } from '../api/categories'
import { PageHeader } from '../components/admin/ui'
import { IconPencil, IconPlus, IconTrash } from '../components/icons'
import { NoticeBanner } from '../components/NoticeBanner'
import type { Category } from '../data/store'
import { useNotice } from '../hooks/useNotice'
import { ApiError } from '../lib/api'

type VisibilityFilter = 'all' | 'active' | 'inactive'

export function CategoriesPage() {
  const { notice, showSuccess, showError, dismiss } = useNotice({
    consumeLocationState: true,
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<VisibilityFilter>('all')

  async function load(opts?: { silent?: boolean }) {
    if (!opts?.silent) {
      setLoading(true)
      setError('')
    }
    try {
      setCategories(await fetchCategories({ includeInactive: true }))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load categories.'
      if (opts?.silent) {
        showError(message)
      } else {
        setError(message)
        setCategories([])
      }
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleDelete(category: Category) {
    const ok = window.confirm(`Delete “${category.name}”? This cannot be undone.`)
    if (!ok) return
    setDeletingId(category.id)
    try {
      await deleteCategory(category.id)
      showSuccess(`“${category.name}” deleted.`)
      if (filter === 'active') setFilter('inactive')
      await load({ silent: true })
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to delete category.')
    } finally {
      setDeletingId(null)
    }
  }

  const activeCount = categories.filter((c) => c.isActive).length
  const inactiveCount = categories.length - activeCount

  const visible = useMemo(() => {
    if (filter === 'active') return categories.filter((c) => c.isActive)
    if (filter === 'inactive') return categories.filter((c) => !c.isActive)
    return categories
  }, [categories, filter])

  const filters: { id: VisibilityFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: categories.length },
    { id: 'active', label: 'Active', count: activeCount },
    { id: 'inactive', label: 'Inactive', count: inactiveCount },
  ]

  return (
    <div className="px-8 py-8 lg:px-10">
      <PageHeader
        title="Categories"
        subtitle={
          loading
            ? 'Loading categories…'
            : `${activeCount} active · ${inactiveCount} inactive`
        }
        action={
          <Link
            to="/categories/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark"
          >
            <IconPlus className="h-4 w-4" />
            Add category
          </Link>
        }
      />

      {notice ? <NoticeBanner notice={notice} onDismiss={dismiss} /> : null}

      {error ? (
        <p className="mt-4 text-[0.9rem] text-burgundy-soft" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && categories.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={[
                'rounded-lg px-3 py-1.5 text-[0.82rem] font-medium transition',
                filter === item.id
                  ? 'bg-burgundy text-white'
                  : 'bg-card text-muted ring-1 ring-border/60 hover:text-admin-ink',
              ].join(' ')}
            >
              {item.label}
              <span className="ml-1.5 tabular-nums opacity-80">{item.count}</span>
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <ul className="mt-7 flex max-w-2xl flex-col gap-2.5">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="h-14 animate-pulse rounded-xl bg-border/40" />
          ))}
        </ul>
      ) : categories.length === 0 ? (
        <p className="mt-8 text-[0.9rem] text-muted">No categories yet.</p>
      ) : visible.length === 0 ? (
        <p className="mt-8 text-[0.9rem] text-muted">
          No {filter === 'inactive' ? 'inactive' : 'active'} categories.
        </p>
      ) : (
        <ul className="mt-7 flex max-w-2xl flex-col gap-2.5">
          {visible.map((category) => (
            <li
              key={category.id}
              className={[
                'flex items-center gap-3 rounded-xl border px-4 py-3.5 shadow-sm',
                category.isActive
                  ? 'border-border/50 bg-card'
                  : 'border-border/40 bg-admin-bg/80',
              ].join(' ')}
            >
              <div className="min-w-0 flex-1">
                <span
                  className={[
                    'font-medium',
                    category.isActive ? 'text-admin-ink' : 'text-muted',
                  ].join(' ')}
                >
                  {category.name}
                </span>
                {!category.isActive ? (
                  <span className="ml-2 inline-flex rounded-md bg-border/50 px-1.5 py-0.5 text-[0.7rem] font-medium tracking-wide text-muted uppercase">
                    Inactive
                  </span>
                ) : null}
              </div>
              <span className="text-[0.85rem] tabular-nums text-muted">
                {String(category.sortOrder).padStart(2, '0')}
              </span>
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  category.isActive ? 'bg-success' : 'bg-muted-light'
                }`}
                title={category.isActive ? 'Active' : 'Inactive'}
              />
              <Link
                to={`/categories/${category.id}/edit`}
                title="Edit category"
                aria-label={`Edit ${category.name}`}
                className="inline-flex items-center justify-center rounded-md p-1.5 text-muted transition hover:bg-accent-pink hover:text-burgundy"
              >
                <IconPencil className="h-4 w-4" />
              </Link>
              <button
                type="button"
                title="Delete category"
                aria-label={`Delete ${category.name}`}
                disabled={deletingId === category.id}
                onClick={() => void handleDelete(category)}
                className="inline-flex items-center justify-center rounded-md p-1.5 text-muted transition hover:bg-attention-bg hover:text-burgundy disabled:opacity-40"
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteCategory, fetchCategories } from '../api/categories'
import { PageHeader } from '../components/admin/ui'
import { IconPencil, IconPlus, IconTrash } from '../components/icons'
import type { Category } from '../data/store'
import { ApiError } from '../lib/api'

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      setCategories(await fetchCategories())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load categories.')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleDelete(category: Category) {
    const ok = window.confirm(`Delete category “${category.name}”?`)
    if (!ok) return
    setDeletingId(category.id)
    setError('')
    try {
      await deleteCategory(category.id)
      setCategories((prev) => prev.filter((c) => c.id !== category.id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete category.')
    } finally {
      setDeletingId(null)
    }
  }

  const activeCount = categories.filter((c) => c.isActive).length

  return (
    <div className="animate-fade-up px-8 py-8 lg:px-10">
      <PageHeader
        title="Categories"
        subtitle={
          loading
            ? 'Loading categories…'
            : `${activeCount} active categories`
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

      {error ? (
        <p className="mt-4 text-[0.9rem] text-burgundy-soft" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <ul className="mt-7 flex max-w-2xl flex-col gap-2.5">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="h-14 animate-pulse rounded-xl bg-border/40" />
          ))}
        </ul>
      ) : categories.length === 0 ? (
        <p className="mt-8 text-[0.9rem] text-muted">No categories yet.</p>
      ) : (
        <ul className="mt-7 flex max-w-2xl flex-col gap-2.5">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3.5 shadow-sm"
            >
              <span className="min-w-0 flex-1 font-medium text-admin-ink">{category.name}</span>
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
                className="inline-flex items-center justify-center rounded-md p-1.5 text-muted transition hover:bg-attention-bg hover:text-burgundy disabled:opacity-50"
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

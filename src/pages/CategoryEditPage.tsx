import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { fetchCategories } from '../api/categories'
import { CategoryForm } from '../components/categories/CategoryForm'
import type { Category } from '../data/store'
import { ApiError } from '../lib/api'

export function CategoryEditPage() {
  const { id = '' } = useParams()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const list = await fetchCategories({ includeInactive: true })
        if (cancelled) return
        const found = list.find((c) => c.id === id || c.slug === id) ?? null
        setCategory(found)
        setMissing(!found)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load category.')
          setMissing(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="animate-fade-up px-6 py-10 text-[0.9rem] text-muted">Loading category…</div>
    )
  }

  if (missing || !category) {
    if (error) {
      return (
        <div className="animate-fade-up px-6 py-10 text-[0.9rem] text-burgundy-soft" role="alert">
          {error}
        </div>
      )
    }
    return <Navigate to="/categories" replace />
  }

  return <CategoryForm key={category.id} mode="edit" initial={category} />
}

import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { fetchPromotionalMessage } from '../api/home'
import { PromoMessageForm } from '../components/home/PromoMessageForm'
import type { PromotionalMessage } from '../data/home'
import { ApiError } from '../lib/api'

export function PromoMessageEditPage() {
  const { id = '' } = useParams()
  const [item, setItem] = useState<PromotionalMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const found = await fetchPromotionalMessage(id)
        if (!cancelled) {
          setItem(found)
          setMissing(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : 'Failed to load promotional message.',
          )
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
      <div className="animate-fade-up px-6 py-10 text-[0.9rem] text-muted">
        Loading promo message…
      </div>
    )
  }

  if (missing || !item) {
    if (error) {
      return (
        <div className="animate-fade-up px-6 py-10 text-[0.9rem] text-burgundy-soft" role="alert">
          {error}
        </div>
      )
    }
    return <Navigate to="/home?tab=promos" replace />
  }

  return <PromoMessageForm key={item.id} mode="edit" initial={item} />
}

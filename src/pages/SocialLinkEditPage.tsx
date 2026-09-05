import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { fetchSocialLink } from '../api/home'
import { SocialLinkForm } from '../components/home/SocialLinkForm'
import type { SocialLink } from '../data/home'
import { ApiError } from '../lib/api'

export function SocialLinkEditPage() {
  const { id = '' } = useParams()
  const [item, setItem] = useState<SocialLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const found = await fetchSocialLink(id)
        if (!cancelled) {
          setItem(found)
          setMissing(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load trending item.')
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
        Loading trending item…
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
    return <Navigate to="/home?tab=trending" replace />
  }

  return <SocialLinkForm key={item.id} mode="edit" initial={item} />
}

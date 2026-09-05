import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  deleteHeroImage,
  deletePromotionalMessage,
  deleteSocialLink,
  fetchHeroImages,
  fetchPromotionalMessages,
  fetchSocialLinks,
} from '../api/home'
import { PageHeader } from '../components/admin/ui'
import { parseHomeTab, type HomeSection } from '../components/home/homeUi'
import { IconPencil, IconPlus, IconTrash } from '../components/icons'
import { NoticeBanner } from '../components/NoticeBanner'
import {
  socialMediaTypeLabel,
  type HeroImage,
  type PromotionalMessage,
  type SocialLink,
} from '../data/home'
import { useNotice } from '../hooks/useNotice'
import { ApiError } from '../lib/api'
import { mediaThumbUrl } from '../lib/mediaUrl'

type VisibilityFilter = 'all' | 'active' | 'inactive'

const TABS: { id: HomeSection; label: string }[] = [
  { id: 'heroes', label: 'Hero images' },
  { id: 'promos', label: 'Promo messages' },
  { id: 'trending', label: 'Trending' },
]

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = parseHomeTab(searchParams.get('tab'))
  const { notice, showSuccess, showError, dismiss } = useNotice({
    consumeLocationState: true,
  })

  const [heroes, setHeroes] = useState<HeroImage[]>([])
  const [promos, setPromos] = useState<PromotionalMessage[]>([])
  const [trending, setTrending] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<VisibilityFilter>('all')

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true)
      setError('')
    }
    try {
      const [h, p, s] = await Promise.all([
        fetchHeroImages({ includeInactive: true }),
        fetchPromotionalMessages({ includeInactive: true }),
        fetchSocialLinks({ includeInactive: true }),
      ])
      setHeroes(h)
      setPromos(p)
      setTrending(s)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load home content.'
      if (opts?.silent) {
        showError(message)
      } else {
        setError(message)
        setHeroes([])
        setPromos([])
        setTrending([])
      }
    } finally {
      if (!opts?.silent) setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    void load()
  }, [load])

  function setTab(next: HomeSection) {
    setSearchParams(next === 'heroes' ? {} : { tab: next }, { replace: true })
    setFilter('all')
  }

  const activeCount = useMemo(() => {
    if (tab === 'heroes') return heroes.filter((i) => i.active).length
    if (tab === 'promos') return promos.filter((i) => i.active).length
    return trending.filter((i) => i.active).length
  }, [tab, heroes, promos, trending])

  const totalCount =
    tab === 'heroes' ? heroes.length : tab === 'promos' ? promos.length : trending.length
  const inactiveCount = totalCount - activeCount

  const addPath =
    tab === 'heroes'
      ? '/home/hero-images/new'
      : tab === 'promos'
        ? '/home/promotional-messages/new'
        : '/home/social-links/new'

  const addLabel =
    tab === 'heroes'
      ? 'Add hero image'
      : tab === 'promos'
        ? 'Add promo message'
        : 'Add trending item'

  async function handleDeleteHero(item: HeroImage) {
    const ok = window.confirm(
      `Permanently delete hero “${item.alt}”? This cannot be undone. To hide it instead, edit and turn off Active.`,
    )
    if (!ok) return
    setDeletingId(item.id)
    try {
      await deleteHeroImage(item.id)
      showSuccess(`Hero “${item.alt}” deleted.`)
      await load({ silent: true })
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to delete hero image.')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDeletePromo(item: PromotionalMessage) {
    const preview =
      item.message.slice(0, 60) + (item.message.length > 60 ? '…' : '')
    const ok = window.confirm(
      `Permanently delete “${preview}”? This cannot be undone.`,
    )
    if (!ok) return
    setDeletingId(item.id)
    try {
      await deletePromotionalMessage(item.id)
      showSuccess('Promo message deleted.')
      await load({ silent: true })
    } catch (err) {
      showError(
        err instanceof ApiError ? err.message : 'Failed to delete promotional message.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDeleteTrending(item: SocialLink) {
    const ok = window.confirm(
      `Permanently delete this ${socialMediaTypeLabel(item.type).toLowerCase()} from trending? This cannot be undone.`,
    )
    if (!ok) return
    setDeletingId(item.id)
    try {
      await deleteSocialLink(item.id)
      showSuccess('Trending item deleted.')
      await load({ silent: true })
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Failed to delete trending item.')
    } finally {
      setDeletingId(null)
    }
  }

  const filters: { id: VisibilityFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: totalCount },
    { id: 'active', label: 'Active', count: activeCount },
    { id: 'inactive', label: 'Inactive', count: inactiveCount },
  ]

  function matchesFilter(active: boolean) {
    if (filter === 'active') return active
    if (filter === 'inactive') return !active
    return true
  }

  const visibleHeroes = heroes.filter((h) => matchesFilter(h.active))
  const visiblePromos = promos.filter((p) => matchesFilter(p.active))
  const visibleTrending = trending.filter((s) => matchesFilter(s.active))

  return (
    <div className="px-8 py-8 lg:px-10">
      <PageHeader
        title="Home"
        subtitle={
          loading
            ? 'Loading homepage content…'
            : `${heroes.length} heroes · ${promos.length} promos · ${trending.length} trending`
        }
        action={
          <Link
            to={addPath}
            className="inline-flex items-center gap-1.5 rounded-lg bg-burgundy px-4 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-burgundy-dark"
          >
            <IconPlus className="h-4 w-4" />
            {addLabel}
          </Link>
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

      {error ? (
        <p className="mt-4 text-[0.9rem] text-burgundy-soft" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && totalCount > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
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
        <ul className="mt-7 flex max-w-3xl flex-col gap-2.5">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="h-16 animate-pulse rounded-xl bg-border/40" />
          ))}
        </ul>
      ) : tab === 'heroes' ? (
        <HeroList
          items={visibleHeroes}
          empty={heroes.length === 0}
          filter={filter}
          deletingId={deletingId}
          onDelete={handleDeleteHero}
        />
      ) : tab === 'promos' ? (
        <PromoList
          items={visiblePromos}
          empty={promos.length === 0}
          filter={filter}
          deletingId={deletingId}
          onDelete={handleDeletePromo}
        />
      ) : (
        <TrendingList
          items={visibleTrending}
          empty={trending.length === 0}
          filter={filter}
          deletingId={deletingId}
          onDelete={handleDeleteTrending}
        />
      )}
    </div>
  )
}

function EmptyState({
  empty,
  filter,
  noun,
}: {
  empty: boolean
  filter: VisibilityFilter
  noun: string
}) {
  if (empty) {
    return <p className="mt-8 text-[0.9rem] text-muted">No {noun} yet.</p>
  }
  return (
    <p className="mt-8 text-[0.9rem] text-muted">
      No {filter === 'inactive' ? 'inactive' : 'active'} {noun}.
    </p>
  )
}

function ActiveDot({ active }: { active: boolean }) {
  return (
    <span
      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
        active ? 'bg-success' : 'bg-muted-light'
      }`}
      title={active ? 'Active' : 'Inactive'}
    />
  )
}

function HeroList({
  items,
  empty,
  filter,
  deletingId,
  onDelete,
}: {
  items: HeroImage[]
  empty: boolean
  filter: VisibilityFilter
  deletingId: string | null
  onDelete: (item: HeroImage) => void
}) {
  if (items.length === 0) {
    return <EmptyState empty={empty} filter={filter} noun="hero images" />
  }

  return (
    <ul className="mt-7 flex max-w-3xl flex-col gap-2.5">
      {items.map((item) => (
        <li
          key={item.id}
          className={[
            'flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm',
            item.active ? 'border-border/50 bg-card' : 'border-border/40 bg-admin-bg/80',
          ].join(' ')}
        >
          <span className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-media-placeholder ring-1 ring-border/60">
            <img
              src={mediaThumbUrl(item.url, 160)}
              alt=""
              className="h-full w-full object-cover"
            />
          </span>
          <div className="min-w-0 flex-1">
            <span
              className={[
                'block truncate font-medium',
                item.active ? 'text-admin-ink' : 'text-muted',
              ].join(' ')}
            >
              {item.alt}
            </span>
            {!item.active ? (
              <span className="mt-0.5 inline-flex rounded-md bg-border/50 px-1.5 py-0.5 text-[0.7rem] font-medium tracking-wide text-muted uppercase">
                Inactive
              </span>
            ) : null}
          </div>
          <span className="text-[0.85rem] tabular-nums text-muted">
            {String(item.order).padStart(2, '0')}
          </span>
          <ActiveDot active={item.active} />
          <Link
            to={`/home/hero-images/${item.id}/edit`}
            title="Edit hero image"
            aria-label={`Edit ${item.alt}`}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted transition hover:bg-accent-pink hover:text-burgundy"
          >
            <IconPencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            title="Delete hero image"
            aria-label={`Delete ${item.alt}`}
            disabled={deletingId === item.id}
            onClick={() => void onDelete(item)}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted transition hover:bg-attention-bg hover:text-burgundy disabled:opacity-40"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}

function PromoList({
  items,
  empty,
  filter,
  deletingId,
  onDelete,
}: {
  items: PromotionalMessage[]
  empty: boolean
  filter: VisibilityFilter
  deletingId: string | null
  onDelete: (item: PromotionalMessage) => void
}) {
  if (items.length === 0) {
    return <EmptyState empty={empty} filter={filter} noun="promo messages" />
  }

  return (
    <ul className="mt-7 flex max-w-3xl flex-col gap-2.5">
      {items.map((item) => (
        <li
          key={item.id}
          className={[
            'flex items-center gap-3 rounded-xl border px-4 py-3.5 shadow-sm',
            item.active ? 'border-border/50 bg-card' : 'border-border/40 bg-admin-bg/80',
          ].join(' ')}
        >
          <div className="min-w-0 flex-1">
            <span
              className={[
                'line-clamp-2 font-medium',
                item.active ? 'text-admin-ink' : 'text-muted',
              ].join(' ')}
            >
              {item.message}
            </span>
            {!item.active ? (
              <span className="mt-1 inline-flex rounded-md bg-border/50 px-1.5 py-0.5 text-[0.7rem] font-medium tracking-wide text-muted uppercase">
                Inactive
              </span>
            ) : null}
          </div>
          <span className="text-[0.85rem] tabular-nums text-muted">
            {String(item.order).padStart(2, '0')}
          </span>
          <ActiveDot active={item.active} />
          <Link
            to={`/home/promotional-messages/${item.id}/edit`}
            title="Edit promo message"
            aria-label="Edit promo message"
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted transition hover:bg-accent-pink hover:text-burgundy"
          >
            <IconPencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            title="Delete promo message"
            aria-label="Delete promo message"
            disabled={deletingId === item.id}
            onClick={() => void onDelete(item)}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted transition hover:bg-attention-bg hover:text-burgundy disabled:opacity-40"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}

function TrendingList({
  items,
  empty,
  filter,
  deletingId,
  onDelete,
}: {
  items: SocialLink[]
  empty: boolean
  filter: VisibilityFilter
  deletingId: string | null
  onDelete: (item: SocialLink) => void
}) {
  if (items.length === 0) {
    return <EmptyState empty={empty} filter={filter} noun="trending items" />
  }

  return (
    <ul className="mt-7 flex max-w-3xl flex-col gap-2.5">
      {items.map((item) => (
        <li
          key={item.id}
          className={[
            'flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm',
            item.active ? 'border-border/50 bg-card' : 'border-border/40 bg-admin-bg/80',
          ].join(' ')}
        >
          <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-media-placeholder ring-1 ring-border/60">
            {item.type === 'video' ? (
              <video
                src={item.url}
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={mediaThumbUrl(item.url, 96)}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <span
              className={[
                'font-medium',
                item.active ? 'text-admin-ink' : 'text-muted',
              ].join(' ')}
            >
              {socialMediaTypeLabel(item.type)}
            </span>
            {!item.active ? (
              <span className="ml-2 inline-flex rounded-md bg-border/50 px-1.5 py-0.5 text-[0.7rem] font-medium tracking-wide text-muted uppercase">
                Inactive
              </span>
            ) : null}
          </div>
          <span className="text-[0.85rem] tabular-nums text-muted">
            {String(item.order).padStart(2, '0')}
          </span>
          <ActiveDot active={item.active} />
          <Link
            to={`/home/social-links/${item.id}/edit`}
            title="Edit trending item"
            aria-label={`Edit trending ${item.type}`}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted transition hover:bg-accent-pink hover:text-burgundy"
          >
            <IconPencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            title="Delete trending item"
            aria-label={`Delete trending ${item.type}`}
            disabled={deletingId === item.id}
            onClick={() => void onDelete(item)}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted transition hover:bg-attention-bg hover:text-burgundy disabled:opacity-40"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}

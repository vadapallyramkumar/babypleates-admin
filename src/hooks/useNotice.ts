import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { NoticeMessage, NoticeTone } from '../components/NoticeBanner'

const DISMISS_MS = 5000

type LocationNoticeState = {
  notice?: NoticeMessage
}

export function useNotice(options?: { consumeLocationState?: boolean }) {
  const [notice, setNotice] = useState<NoticeMessage | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const consumeLocationState = options?.consumeLocationState ?? false

  const dismiss = useCallback(() => setNotice(null), [])

  const show = useCallback((message: string, tone: NoticeTone = 'success') => {
    const trimmed = message.trim()
    if (!trimmed) return
    setNotice({ tone, message: trimmed })
  }, [])

  const showSuccess = useCallback((message: string) => show(message, 'success'), [show])
  const showError = useCallback((message: string) => show(message, 'error'), [show])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (!consumeLocationState) return
    const state = location.state as LocationNoticeState | null
    const incoming = state?.notice
    if (!incoming?.message?.trim()) return

    setNotice({
      tone: incoming.tone === 'error' ? 'error' : 'success',
      message: incoming.message.trim(),
    })
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }, [consumeLocationState, location.pathname, location.search, location.state, navigate])

  return { notice, show, showSuccess, showError, dismiss, setNotice }
}

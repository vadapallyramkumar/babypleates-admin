export type NoticeTone = 'success' | 'error'

export type NoticeMessage = {
  tone: NoticeTone
  message: string
}

/** Pass as `navigate(path, { state: noticeLocationState('…') })`. */
export function noticeLocationState(
  message: string,
  tone: NoticeTone = 'success',
): { notice: NoticeMessage } {
  return { notice: { tone, message: message.trim() } }
}

export function NoticeBanner({
  notice,
  onDismiss,
  className = 'mt-4',
}: {
  notice: NoticeMessage
  onDismiss?: () => void
  className?: string
}) {
  return (
    <div
      role={notice.tone === 'error' ? 'alert' : 'status'}
      className={[
        'flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-[0.9rem] font-medium shadow-sm',
        notice.tone === 'success'
          ? 'border-live/30 bg-live-bg text-success'
          : 'border-burgundy/20 bg-attention-bg text-burgundy-soft',
        className,
      ].join(' ')}
    >
      <p>{notice.message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-[0.8rem] font-semibold opacity-70 transition hover:opacity-100"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  )
}

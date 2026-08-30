export function DressLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Left sprig */}
      <path
        d="M14 28c2-6 7-9 11-10-1 4-3 8-7 11-2 1.5-3.5 1-4-1z"
        fill="#5c1a2e"
        opacity="0.85"
      />
      <path
        d="M12 34c3-5 8-7 12-7-2 4-4 7-8 9-2 1-3.5.5-4-2z"
        fill="#7a2d45"
        opacity="0.7"
      />
      {/* Right sprig */}
      <path
        d="M58 28c-2-6-7-9-11-10 1 4 3 8 7 11 2 1.5 3.5 1 4-1z"
        fill="#5c1a2e"
        opacity="0.85"
      />
      <path
        d="M60 34c-3-5-8-7-12-7 2 4 4 7 8 9 2 1 3.5.5 4-2z"
        fill="#7a2d45"
        opacity="0.7"
      />
      {/* Hanger */}
      <path
        d="M36 14c-2.2 0-4 1.6-4 3.5 0 1.2.7 2.2 1.7 2.8"
        stroke="#5c1a2e"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M22 22h28"
        stroke="#5c1a2e"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M33.7 20.3C34.2 19.2 35 18.5 36 18.5c1.2 0 2.2.9 2.5 2"
        stroke="#5c1a2e"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Dress bodice */}
      <path
        d="M28 22.5h16l2.5 6.5H25.5L28 22.5z"
        fill="#5c1a2e"
      />
      {/* Pleated skirt */}
      <path
        d="M25.5 29h21l4.5 26H21l4.5-26z"
        fill="#5c1a2e"
      />
      <path
        d="M29 29.5l-1.5 25.5M33 29.5l-.5 25.5M36 29.5v25.5M39 29.5l.5 25.5M43 29.5l1.5 25.5"
        stroke="#7a2d45"
        strokeWidth="1"
        opacity="0.55"
      />
      <path
        d="M25.5 29h21"
        stroke="#4a1425"
        strokeWidth="1"
      />
    </svg>
  )
}

export function FloralDecoration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Stems */}
      <path
        d="M40 180C55 140 70 110 95 85"
        stroke="#5a7a4a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M70 180C85 145 110 115 140 95"
        stroke="#6b8f58"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M110 180C125 150 150 125 175 110"
        stroke="#5a7a4a"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Leaves */}
      <path
        d="M72 120c12-8 22-6 28 2-10 6-20 8-28-2z"
        fill="#6b8f58"
      />
      <path
        d="M100 100c14-10 26-8 32 4-12 7-24 9-32-4z"
        fill="#5a7a4a"
      />
      <path
        d="M55 145c10-7 18-5 22 3-8 5-16 6-22-3z"
        fill="#7a9e66"
      />
      <path
        d="M130 130c11-8 20-6 24 3-9 5-17 7-24-3z"
        fill="#6b8f58"
      />
      {/* Flowers */}
      <g transform="translate(95 70)">
        <circle cx="0" cy="0" r="10" fill="#e8a09a" />
        <circle cx="-9" cy="-5" r="8" fill="#d97a7a" />
        <circle cx="9" cy="-5" r="8" fill="#d97a7a" />
        <circle cx="-6" cy="8" r="7.5" fill="#c96a6a" />
        <circle cx="7" cy="8" r="7.5" fill="#c96a6a" />
        <circle cx="0" cy="0" r="4.5" fill="#f5d0a9" />
      </g>
      <g transform="translate(140 88)">
        <circle cx="0" cy="0" r="8" fill="#e8a09a" />
        <circle cx="-7" cy="-4" r="6.5" fill="#d97a7a" />
        <circle cx="7" cy="-4" r="6.5" fill="#d97a7a" />
        <circle cx="-5" cy="6" r="6" fill="#c96a6a" />
        <circle cx="5" cy="6" r="6" fill="#c96a6a" />
        <circle cx="0" cy="0" r="3.5" fill="#f5d0a9" />
      </g>
      <g transform="translate(165 108)">
        <circle cx="0" cy="0" r="7" fill="#e8a09a" />
        <circle cx="-6" cy="-3" r="5.5" fill="#d97a7a" />
        <circle cx="6" cy="-3" r="5.5" fill="#d97a7a" />
        <circle cx="-4" cy="5" r="5" fill="#c96a6a" />
        <circle cx="4" cy="5" r="5" fill="#c96a6a" />
        <circle cx="0" cy="0" r="3" fill="#f5d0a9" />
      </g>
      <g transform="translate(118 55)">
        <circle cx="0" cy="0" r="6" fill="#e8b0aa" />
        <circle cx="-5" cy="-2" r="5" fill="#d98a85" />
        <circle cx="5" cy="-2" r="5" fill="#d98a85" />
        <circle cx="-3" cy="4" r="4.5" fill="#c97a75" />
        <circle cx="3" cy="4" r="4.5" fill="#c97a75" />
        <circle cx="0" cy="0" r="2.5" fill="#f5d0a9" />
      </g>
    </svg>
  )
}

export function IconBox({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 8.5L12 3.5L3 8.5V15.5L12 20.5L21 15.5V8.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M3 8.5L12 13.5L21 8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 13.5V20.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function IconImage({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
      <path
        d="M3 16L8 12.5L11.5 15L15.5 10.5L21 16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconSettings({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3.5V6M12 18v2.5M3.5 12H6M18 12h2.5M5.6 5.6L7.4 7.4M16.6 16.6l1.8 1.8M18.4 5.6L16.6 7.4M7.4 16.6L5.6 18.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconMail({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4 7.5L12 13L20 7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconLock({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 10V7.5a4 4 0 0 1 8 0V10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconEye({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function IconEyeOff({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9.9 5.1A10.4 10.4 0 0 1 12 4.7c6 0 9.5 7.3 9.5 7.3a16 16 0 0 1-3.4 4.1M6.2 6.8A15.6 15.6 0 0 0 2.5 12S6 18.5 12 18.5c1.4 0 2.7-.3 3.9-.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10.1 10.2a2.5 2.5 0 0 0 3.6 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconShield({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l8 3.5v5.2c0 4.6-3.1 8.7-8 9.8-4.9-1.1-8-5.2-8-9.8V6.5L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12.2l1.8 1.8 3.7-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconSearch({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function IconPlus({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconCopy({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="9"
        y="9"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M5 15V7a2 2 0 0 1 2-2h8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconCheck({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconChevronDown({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconMore({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function IconPencil({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.5 5.5l4 4L8 20H4v-4L14.5 5.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M13 7l4 4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function IconArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconChevronRight({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconTrash({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

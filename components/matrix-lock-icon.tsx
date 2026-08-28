"use client"

interface MatrixLockIconProps {
  size?: number
  locked?: boolean
  className?: string
}

export function MatrixLockIcon({ size = 32, locked = true, className = "" }: MatrixLockIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={{ filter: "drop-shadow(0 0 5px rgba(0,255,65,0.55)) drop-shadow(0 0 10px rgba(0,255,65,0.25))" }}
    >
      <defs>
        <filter id="matrix-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0.1  0 0 0 0 0.2  0 0 0 1 0" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="matrix-grid-lock" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M 4 0 H 0 V 4" fill="none" stroke="rgba(0,255,65,0.08)" strokeWidth="0.5" />
        </pattern>
        <linearGradient id="lock-body-grad" x1="7" y1="13" x2="25" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#001a06" />
          <stop offset="50%" stopColor="#00260c" />
          <stop offset="100%" stopColor="#001208" />
        </linearGradient>
      </defs>

      {/* Shackle - U shape */}
      {locked ? (
        <path
          d="M 10 14 V 9 C 10 5.2 12.8 2.5 16 2.5 C 19.2 2.5 22 5.2 22 9 V 14"
          stroke="#00ff41"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#matrix-glow)"
          opacity="0.98"
        />
      ) : (
        <path
          d="M 10 14 V 9 C 10 5.2 12.8 2.5 16 2.5 C 19.2 2.5 22 5.2 22 9 V 10"
          stroke="#00ff41"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#matrix-glow)"
          opacity="0.85"
        />
      )}

      {/* Inner shackle highlight */}
      <path
        d="M 11.2 14 V 9 C 11.2 6.1 13.4 3.8 16 3.8 C 18.6 3.8 20.8 6.1 20.8 9 V 14"
        stroke="rgba(0,255,65,0.22)"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Lock body */}
      <rect
        x="7"
        y="13.2"
        width="18"
        height="15.3"
        rx="2.2"
        ry="2.2"
        fill="url(#lock-body-grad)"
        stroke="#00ff41"
        strokeWidth="1.6"
        filter="url(#matrix-glow)"
      />
      {/* Grid overlay inside body */}
      <rect x="7" y="13.2" width="18" height="15.3" rx="2.2" ry="2.2" fill="url(#matrix-grid-lock)" opacity="0.9" />

      {/* Top highlight on body */}
      <path
        d="M 9 14.8 H 23"
        stroke="rgba(0,255,65,0.28)"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Keyhole - outer glow */}
      <circle cx="16" cy="19.2" r="3.6" fill="rgba(0,255,65,0.16)" />
      {/* Keyhole - main circle */}
      <circle cx="16" cy="19.2" r="2.7" fill="#00ff41" stroke="#001a06" strokeWidth="0.6" />
      {/* Keyhole - inner dark */}
      <circle cx="16" cy="18.9" r="1.15" fill="#001208" />
      {/* Keyhole - slit */}
      <path d="M 15.1 20.2 L 14.2 23.6 H 17.8 L 16.9 20.2 Z" fill="#001208" stroke="#001208" strokeLinejoin="round" />
      {/* Keyhole - highlight */}
      <circle cx="15.1" cy="18.2" r="0.55" fill="rgba(255,255,255,0.55)" />

      {/* Binary / matrix code faint on body */}
      <text
        x="8.6"
        y="26.8"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="3.2"
        fontWeight="700"
        fill="rgba(0,255,65,0.42)"
        letterSpacing="0.3"
      >
        01
      </text>
      <text
        x="22.2"
        y="26.8"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="3.2"
        fontWeight="700"
        fill="rgba(0,255,65,0.32)"
        letterSpacing="0.3"
        textAnchor="end"
      >
        10
      </text>

      {/* Side screws / rivets */}
      <circle cx="9.6" cy="15.6" r="0.7" fill="rgba(0,255,65,0.35)" stroke="rgba(0,255,65,0.5)" strokeWidth="0.4" />
      <circle cx="22.4" cy="15.6" r="0.7" fill="rgba(0,255,65,0.35)" stroke="rgba(0,255,65,0.5)" strokeWidth="0.4" />
      <circle cx="9.6" cy="26.2" r="0.7" fill="rgba(0,255,65,0.28)" stroke="rgba(0,255,65,0.4)" strokeWidth="0.4" />
      <circle cx="22.4" cy="26.2" r="0.7" fill="rgba(0,255,65,0.28)" stroke="rgba(0,255,65,0.4)" strokeWidth="0.4" />

      {/* Scanning line */}
      <rect x="7" y="20.8" width="18" height="0.7" fill="rgba(0,255,65,0.14)" rx="0.35" />

      {/* Outer border glow pulse hint */}
      <rect
        x="6.6"
        y="12.8"
        width="18.8"
        height="16.1"
        rx="2.6"
        fill="none"
        stroke="rgba(0,255,65,0.08)"
        strokeWidth="0.5"
      />
    </svg>
  )
}

// Kleine Variante für Inline-Nutzung (z.B. 16px)
export function MatrixLockIconSmall(props: Omit<MatrixLockIconProps, "size">) {
  return <MatrixLockIcon size={20} {...props} />
}

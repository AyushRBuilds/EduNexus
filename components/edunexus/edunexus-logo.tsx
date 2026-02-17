import { cn } from "@/lib/utils"

interface EduNexusLogoProps {
  size?: number
  className?: string
}

export function EduNexusLogo({ size = 32, className }: EduNexusLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Magnifying glass circle */}
      <circle
        cx="28"
        cy="28"
        r="20"
        stroke="url(#logoGrad)"
        strokeWidth="3.5"
        fill="none"
      />
      {/* Handle */}
      <line
        x1="43"
        y1="43"
        x2="58"
        y2="58"
        stroke="url(#logoGrad)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Inner molecular / nexus network */}
      {/* Center node */}
      <circle cx="28" cy="28" r="3" fill="url(#logoGrad)" />

      {/* Top node */}
      <circle cx="28" cy="16" r="2.2" fill="url(#logoGrad)" />
      <line x1="28" y1="25" x2="28" y2="18.2" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Bottom-left node */}
      <circle cx="18" cy="36" r="2.2" fill="url(#logoGrad)" />
      <line x1="25.5" y1="30" x2="20" y2="34.2" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Bottom-right node */}
      <circle cx="38" cy="36" r="2.2" fill="url(#logoGrad)" />
      <line x1="30.5" y1="30" x2="36" y2="34.2" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Top-left node */}
      <circle cx="17" cy="22" r="2" fill="url(#logoGrad)" />
      <line x1="25.5" y1="26.5" x2="19" y2="23.5" stroke="url(#logoGrad)" strokeWidth="1.2" strokeLinecap="round" />

      {/* Top-right node */}
      <circle cx="39" cy="22" r="2" fill="url(#logoGrad)" />
      <line x1="30.5" y1="26.5" x2="37" y2="23.5" stroke="url(#logoGrad)" strokeWidth="1.2" strokeLinecap="round" />

      {/* Cross connections for nexus feel */}
      <line x1="28" y1="18.2" x2="18.5" y2="23" stroke="url(#logoGrad)" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
      <line x1="28" y1="18.2" x2="37.5" y2="23" stroke="url(#logoGrad)" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
      <line x1="18.5" y1="34" x2="36" y2="34" stroke="url(#logoGrad)" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />

      <defs>
        <linearGradient id="logoGrad" x1="8" y1="8" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
      </defs>
    </svg>
  )
}

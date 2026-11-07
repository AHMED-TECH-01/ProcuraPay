import React from 'react';

export type LogoVariant = 'default' | 'monochrome' | 'light' | 'dark' | 'white';

interface LogoMarkProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  variant?: LogoVariant;
  className?: string;
}

export const LogoMark: React.FC<LogoMarkProps> = ({
  size = 'md',
  variant = 'default',
  className = '',
}) => {
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 24
      : size === 'md'
      ? 32
      : size === 'lg'
      ? 44
      : 56;

  // Colors based on variant
  const isDark = variant === 'dark';
  const isWhite = variant === 'white';
  const isMono = variant === 'monochrome';

  const primaryColor = isWhite ? '#FFFFFF' : isDark ? '#FFFFFF' : isMono ? '#111827' : '#187B61';
  const accentColor = isWhite ? '#D1FAE5' : isDark ? '#34D399' : isMono ? '#4B5563' : '#16835D';
  const coreGlow = isWhite ? '#A7F3D0' : isDark ? '#10B981' : isMono ? '#9CA3AF' : '#10B981';
  const bgFill = isDark ? '#0D382C' : isWhite ? 'rgba(255,255,255,0.15)' : '#F0FDF4';

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label="ProcuraPay AI Logo Mark"
    >
      <defs>
        {/* Core Emerald Radial Gradient */}
        <radialGradient id="procura-core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={coreGlow} stopOpacity="0.9" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
        </radialGradient>

        {/* Stem & Loop Gradient */}
        <linearGradient id="procura-p-gradient" x1="16" y1="12" x2="52" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>

        {/* Subtle Drop Shadow */}
        <filter id="procura-shadow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#187B61" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Hexagonal Background Base */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill={bgFill}
        stroke={isWhite ? 'rgba(255,255,255,0.3)' : isDark ? 'rgba(52,211,153,0.3)' : 'rgba(24,123,97,0.18)'}
        strokeWidth="1.5"
      />

      {/* Ambient Central Node Radial Glow */}
      <circle cx="34" cy="24" r="14" fill="url(#procura-core-glow)" opacity="0.35" />

      {/* Connected Circuit Paths (Procurement Workflows) */}
      <path
        d="M20 48V20C20 15.5817 23.5817 12 28 12H38C44.6274 12 50 17.3726 50 24C50 30.6274 44.6274 36 38 36H20"
        stroke="url(#procura-p-gradient)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Financial Settlement Diagonal Flow (Connected Transaction Path) */}
      <path
        d="M34 36L44 48"
        stroke="url(#procura-p-gradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="1 0.5"
      />

      {/* Verification / Workflow Nodes */}
      {/* Node 1: Origin Request Node (bottom-left) */}
      <circle cx="20" cy="48" r="3.5" fill={primaryColor} stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Node 2: Decision Core Point (top-center) */}
      <circle cx="38" cy="24" r="4.5" fill={coreGlow} stroke="#FFFFFF" strokeWidth="2" />

      {/* Node 3: Execution / Settlement Node (bottom-right) */}
      <circle cx="44" cy="48" r="3.5" fill={accentColor} stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Node 4: Policy Gateway Node (top-left curve) */}
      <circle cx="20" cy="20" r="2.5" fill={accentColor} />
    </svg>
  );
};

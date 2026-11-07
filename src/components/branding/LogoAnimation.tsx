import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface LogoAnimationProps {
  size?: number;
  className?: string;
  onAnimationComplete?: () => void;
}

export const LogoAnimation: React.FC<LogoAnimationProps> = ({
  size = 64,
  className = '',
  onAnimationComplete,
}) => {
  const shouldReduceMotion = useReducedMotion();

  // If user prefers reduced motion, render clean static mark
  if (shouldReduceMotion) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        className={className}
      >
        <rect x="2" y="2" width="60" height="60" rx="16" fill="#F0FDF4" stroke="rgba(24,123,97,0.2)" strokeWidth="1.5" />
        <path
          d="M20 48V20C20 15.5817 23.5817 12 28 12H38C44.6274 12 50 17.3726 50 24C50 30.6274 44.6274 36 38 36H20"
          stroke="#187B61"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M34 36L44 48" stroke="#16835D" strokeWidth="4" strokeLinecap="round" />
        <circle cx="20" cy="48" r="3.5" fill="#187B61" />
        <circle cx="38" cy="24" r="4.5" fill="#10B981" />
        <circle cx="44" cy="48" r="3.5" fill="#16835D" />
      </svg>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="anim-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#187B61" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="anim-p-grad" x1="16" y1="12" x2="52" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#187B61" />
            <stop offset="100%" stopColor="#16835D" />
          </linearGradient>
        </defs>

        {/* 1. Background Shell Fade & Scale */}
        <motion.rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="16"
          fill="#F0FDF4"
          stroke="rgba(24,123,97,0.22)"
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />

        {/* 2. Core Glow Bloom */}
        <motion.circle
          cx="38"
          cy="24"
          r="16"
          fill="url(#anim-core-glow)"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.6, 0.35], scale: [0.4, 1.2, 1] }}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
        />

        {/* 3. Main 'P' Path Stroke Draw */}
        <motion.path
          d="M20 48V20C20 15.5817 23.5817 12 28 12H38C44.6274 12 50 17.3726 50 24C50 30.6274 44.6274 36 38 36H20"
          stroke="url(#anim-p-grad)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.85, ease: 'easeInOut' }}
        />

        {/* 4. Financial Settlement Diagonal Path Draw */}
        <motion.path
          d="M34 36L44 48"
          stroke="url(#anim-p-grad)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4, ease: 'easeOut' }}
          onAnimationComplete={onAnimationComplete}
        />

        {/* 5. Sequential Nodes */}
        {/* Node 1: Request Origin */}
        <motion.circle
          cx="20"
          cy="48"
          r="3.5"
          fill="#187B61"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.25, type: 'spring' }}
        />

        {/* Node 2: Decision Core */}
        <motion.circle
          cx="38"
          cy="24"
          r="4.5"
          fill="#10B981"
          stroke="#FFFFFF"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.35, 1], opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.4, ease: 'easeOut' }}
        />

        {/* Node 3: Settlement Node */}
        <motion.circle
          cx="44"
          cy="48"
          r="3.5"
          fill="#16835D"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.95, duration: 0.25, type: 'spring' }}
        />
      </svg>
    </div>
  );
};

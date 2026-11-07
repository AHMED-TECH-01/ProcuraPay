import React from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, Cpu } from 'lucide-react';

interface SceneFallbackProps {
  className?: string;
  interactive?: boolean;
}

export const SceneFallback: React.FC<SceneFallbackProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`relative w-full h-full min-h-[460px] flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/5 via-[#F7F8F6] to-teal-900/5 p-6 border border-emerald-900/10 ${className}`}
      aria-label="ProcuraPay AI Procurement Core Visualization"
    >
      {/* Background Radial Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl animate-pulse-subtle" />
        <div className="w-48 h-48 rounded-full bg-[#187B61]/15 blur-2xl" />
      </div>

      {/* SVG Orbital Core Graphic */}
      <svg
        className="w-full max-w-[440px] h-auto drop-shadow-sm"
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="orbit-grad-1" x1="0" y1="0" x2="500" y2="500" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#187B61" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#34D399" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#187B61" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="orbit-grad-2" x1="500" y1="0" x2="0" y2="500" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id="core-3d-sphere" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ECFDF5" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#A7F3D0" stopOpacity="0.75" />
            <stop offset="85%" stopColor="#187B61" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#064E3B" stopOpacity="0.95" />
          </radialGradient>
        </defs>

        {/* Outer Orbit 1 */}
        <ellipse
          cx="250"
          cy="250"
          rx="210"
          ry="90"
          transform="rotate(-25 250 250)"
          stroke="url(#orbit-grad-1)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />

        {/* Outer Orbit 2 */}
        <ellipse
          cx="250"
          cy="250"
          rx="180"
          ry="110"
          transform="rotate(40 250 250)"
          stroke="url(#orbit-grad-2)"
          strokeWidth="1.5"
        />

        {/* Inner Orbit 3 */}
        <ellipse
          cx="250"
          cy="250"
          rx="140"
          ry="70"
          transform="rotate(10 250 250)"
          stroke="url(#orbit-grad-1)"
          strokeWidth="1.2"
        />

        {/* Connecting Data Rays */}
        <line x1="250" y1="250" x2="90" y2="180" stroke="#187B61" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <line x1="250" y1="250" x2="410" y2="170" stroke="#187B61" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <line x1="250" y1="250" x2="160" y2="390" stroke="#187B61" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <line x1="250" y1="250" x2="380" y2="360" stroke="#187B61" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

        {/* Central Procurement Core */}
        <circle cx="250" cy="250" r="62" fill="url(#core-3d-sphere)" />
        {/* Specular Highlight */}
        <ellipse cx="230" cy="225" rx="20" ry="12" fill="#FFFFFF" opacity="0.5" transform="rotate(-15 230 225)" />

        {/* Core Lattice Rings */}
        <circle cx="250" cy="250" r="54" stroke="#FFFFFF" strokeWidth="1" opacity="0.4" />
        <ellipse cx="250" cy="250" rx="60" ry="24" stroke="#FFFFFF" strokeWidth="1" opacity="0.35" transform="rotate(20 250 250)" />

        {/* Satellite Node 1: AI Research */}
        <circle cx="90" cy="180" r="10" fill="#187B61" stroke="#FFFFFF" strokeWidth="2.5" />
        <circle cx="90" cy="180" r="16" stroke="#34D399" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />

        {/* Satellite Node 2: Vendor Comparison */}
        <circle cx="410" cy="170" r="9" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2.5" />
        <circle cx="410" cy="170" r="15" stroke="#38BDF8" strokeWidth="1" opacity="0.6" />

        {/* Satellite Node 3: Policy Compliance */}
        <circle cx="160" cy="390" r="9" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
        <circle cx="160" cy="390" r="15" stroke="#34D399" strokeWidth="1" opacity="0.6" />

        {/* Satellite Node 4: Human-Controlled Payment */}
        <circle cx="380" cy="360" r="11" fill="#0D9488" stroke="#FFFFFF" strokeWidth="3" />
        <circle cx="380" cy="360" r="18" stroke="#2DD4BF" strokeWidth="1.2" strokeDasharray="3 2" />
      </svg>

      {/* Floating Status Badge */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between glass-surface px-4 py-2.5 rounded-xl text-xs">
        <div className="flex items-center space-x-2 text-gray-700 font-medium">
          <Cpu className="w-4 h-4 text-[#187B61]" />
          <span>The Intelligent Procurement Core</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md font-semibold">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Live Verified</span>
        </div>
      </div>
    </div>
  );
};

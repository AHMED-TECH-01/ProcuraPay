import React from 'react';

interface GlassSurfaceProps {
  children: React.ReactNode;
  variant?: 'surface' | 'navigation' | 'panel' | 'subtle';
  className?: string;
  glow?: boolean;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  variant = 'surface',
  className = '',
  glow = false,
}) => {
  const variantClass =
    variant === 'navigation'
      ? 'glass-navigation'
      : variant === 'panel'
      ? 'glass-panel'
      : variant === 'subtle'
      ? 'bg-white/50 backdrop-blur-md border border-white/60 shadow-2xs'
      : 'glass-surface';

  const glowClass = glow
    ? 'relative before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-r before:from-emerald-500/20 before:to-teal-500/0 before:-z-10'
    : '';

  return (
    <div className={`rounded-2xl ${variantClass} ${glowClass} ${className}`}>
      {children}
    </div>
  );
};

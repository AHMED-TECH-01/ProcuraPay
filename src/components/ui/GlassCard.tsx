import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'accent' | 'highlight' | 'compact';
  interactive?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  onClick,
}) => {
  const variantStyles =
    variant === 'accent'
      ? 'border-[#187B61]/25 bg-gradient-to-br from-white/95 to-emerald-50/40'
      : variant === 'highlight'
      ? 'border-emerald-300/40 bg-gradient-to-br from-white/95 via-white/80 to-teal-50/50 shadow-md'
      : variant === 'compact'
      ? 'p-3 rounded-xl'
      : 'p-6 rounded-2xl';

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:-translate-y-1 hover:border-[#187B61]/35 hover:shadow-lg transition-all duration-200'
    : '';

  return (
    <div
      onClick={onClick}
      className={`liquid-glass-card relative overflow-hidden ${variantStyles} ${interactiveStyles} ${className}`}
    >
      {/* Specular Top Edge Light Reflection */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90 pointer-events-none" />
      {children}
    </div>
  );
};

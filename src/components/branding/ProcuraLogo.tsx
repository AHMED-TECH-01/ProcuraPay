import React from 'react';
import { LogoMark, LogoVariant } from './LogoMark';

interface ProcuraLogoProps {
  variant?: LogoVariant;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ProcuraLogo: React.FC<ProcuraLogoProps> = ({
  variant = 'default',
  size = 'md',
  showTagline = false,
  className = '',
  onClick,
}) => {
  const isDark = variant === 'dark';
  const isWhite = variant === 'white';

  const markSize = size === 'sm' ? 28 : size === 'md' ? 36 : 46;
  const brandTextClass =
    size === 'sm'
      ? 'text-base font-bold tracking-tight'
      : size === 'md'
      ? 'text-lg font-extrabold tracking-tight'
      : 'text-2xl font-black tracking-tight';

  const textColor = isWhite
    ? 'text-white'
    : isDark
    ? 'text-white'
    : variant === 'monochrome'
    ? 'text-gray-900'
    : 'text-[#111827]';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center space-x-2.5 select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <LogoMark size={markSize} variant={variant} />

      <div className="flex flex-col leading-none">
        <div className="flex items-center space-x-1.5">
          <span className={`${brandTextClass} ${textColor}`}>
            Procura<span className={isWhite ? 'text-emerald-200' : 'text-[#187B61]'}>Pay</span>
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
              isWhite
                ? 'bg-white/20 text-white border border-white/30'
                : isDark
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                : 'bg-[#187B61]/10 text-[#187B61] border border-[#187B61]/20'
            }`}
          >
            AI
          </span>
        </div>

        {showTagline && (
          <span className="text-[10px] text-gray-500 font-medium tracking-normal mt-0.5">
            Autonomous Procurement • Human Control
          </span>
        )}
      </div>
    </div>
  );
};

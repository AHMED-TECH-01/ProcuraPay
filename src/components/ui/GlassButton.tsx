import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface GlassButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const sizeClasses =
    size === 'sm'
      ? 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5'
      : size === 'lg'
      ? 'px-6 py-3 text-sm rounded-xl gap-2.5 font-semibold'
      : 'px-4.5 py-2.5 text-xs rounded-xl gap-2 font-medium';

  const variantClasses =
    variant === 'primary'
      ? 'bg-[#187B61] text-white hover:bg-[#16835D] shadow-sm hover:shadow-md border border-[#16835D]/40'
      : variant === 'secondary'
      ? 'bg-white/80 hover:bg-white text-gray-800 border border-gray-200/90 shadow-2xs hover:border-[#187B61]/30 backdrop-blur-md'
      : variant === 'glass'
      ? 'glass-surface text-gray-900 hover:text-[#187B61] hover:border-[#187B61]/40 shadow-xs'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60';

  const baseClasses =
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none outline-none';

  if (shouldReduceMotion) {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      >
        {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
      </button>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
    >
      {/* Specular gleam on primary button */}
      {variant === 'primary' && (
        <span className="absolute top-0 inset-x-0 h-px bg-white/30 rounded-t-xl" />
      )}
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </motion.button>
  );
};

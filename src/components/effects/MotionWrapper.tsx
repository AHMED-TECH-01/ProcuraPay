import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface MotionWrapperProps {
  children: React.ReactNode;
  hoverScale?: number;
  hoverY?: number;
  tapScale?: number;
  className?: string;
  onClick?: () => void;
}

export const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  hoverScale = 1.015,
  hoverY = -2,
  tapScale = 0.985,
  className = '',
  onClick,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div onClick={onClick} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: hoverScale, y: hoverY }}
      whileTap={{ scale: tapScale }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
};

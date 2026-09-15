import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface HandwrittenButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const HandwrittenButton: React.FC<HandwrittenButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  className = ''
}) => {
  const [rotation] = useState(() => (Math.random() * 2 - 1));
  
  const baseClasses = "px-6 py-2 rounded font-bold text-xl inline-block cursor-pointer";
  const variantClasses = variant === 'primary' 
    ? "btn-handwritten" 
    : "border-2 border-[var(--color-notebook-red-ink)] text-[var(--color-notebook-red-ink)] hover:bg-red-50 font-[var(--font-patrick)]";

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses} ${className}`}
      onClick={onClick}
      style={{ rotate: `${rotation}deg` }}
      whileTap={{ scale: 0.95, y: 2 }}
      whileHover={{ scale: 1.05 }}
    >
      <span className="border-b-2 border-current pb-1 inline-block">
        {children}
      </span>
    </motion.button>
  );
};

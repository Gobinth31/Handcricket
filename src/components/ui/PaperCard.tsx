import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PaperCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hasStaple?: boolean;
}

export const PaperCard: React.FC<PaperCardProps> = ({ children, className = '', onClick, hasStaple = true }) => {
  const [rotation] = useState(() => (Math.random() * 4 - 2));

  return (
    <motion.div
      className={`paper-card p-6 pl-12 cursor-pointer ${className}`}
      onClick={onClick}
      initial={{ rotate: rotation, y: 0 }}
      whileHover={{ rotate: 0, y: -5, boxShadow: '4px 8px 15px rgba(0, 0, 0, 0.15)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {hasStaple && <div className="staple" />}
      <div className="relative z-10 handwritten text-lg">
        {children}
      </div>
    </motion.div>
  );
};

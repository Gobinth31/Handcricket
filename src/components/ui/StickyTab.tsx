import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface StickyTabProps {
  label: string;
  color: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const StickyTab: React.FC<StickyTabProps> = ({ label, color, isActive, onClick }) => {
  const [rotation] = useState(() => (Math.random() * 4 - 2));

  return (
    <motion.div
      className={`sticky-tab px-4 py-2 cursor-pointer font-[var(--font-patrick)] text-lg font-semibold whitespace-nowrap transition-colors`}
      style={{ 
        backgroundColor: color, 
        rotate: `${rotation}deg`,
        color: '#333'
      }}
      onClick={onClick}
      animate={{ 
        scale: isActive ? 1.1 : 1,
        y: isActive ? -5 : 0,
        filter: isActive ? 'brightness(1.1)' : 'brightness(0.9)'
      }}
      whileHover={{ scale: 1.05, y: -2 }}
    >
      {label}
    </motion.div>
  );
};

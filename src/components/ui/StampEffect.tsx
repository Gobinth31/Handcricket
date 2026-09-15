import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface StampEffectProps {
  text: string;
  onComplete?: () => void;
}

export const StampEffect: React.FC<StampEffectProps> = ({ text, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <motion.div
        className="stamp-effect text-6xl md:text-8xl bg-white/10 backdrop-blur-sm"
        initial={{ scale: 2, opacity: 0, rotate: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: -15 }}
        exit={{ opacity: 0, scale: 1.5 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
      >
        {text}
      </motion.div>
    </div>
  );
};

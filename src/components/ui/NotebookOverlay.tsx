import React from 'react';
import { motion } from 'framer-motion';

interface NotebookOverlayProps {
  children: React.ReactNode;
  title?: string;
}

export const NotebookOverlay: React.FC<NotebookOverlayProps> = ({ children, title }) => {
  return (
    <motion.div 
      className="fixed inset-0 z-10 p-4 md:p-8 flex justify-center items-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="notebook-page w-full max-w-4xl h-full max-h-[90vh] rounded-r-lg rounded-l-sm flex flex-col pointer-events-auto overflow-hidden relative shadow-xl">
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-evenly items-center bg-gray-100 z-10 border-r border-gray-300">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-gray-800 border-2 border-gray-600 shadow-inner" />
          ))}
        </div>
        
        <div className="pl-24 pr-8 py-8 flex-1 overflow-y-auto z-10">
          {title && (
            <h1 className="notebook-title mb-6">{title}</h1>
          )}
          <div className="handwritten text-xl">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotebookOverlay;

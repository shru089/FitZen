import React from 'react';
import { motion } from 'framer-motion';

const ClayInput = ({ 
  label,
  error,
  icon,
  className = '',
  variant = 'default',
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'inset':
        return 'bg-[#f7fcf8] shadow-[inset_6px_6px_12px_rgba(12,204,72,0.1),inset_-6px_-6px_12px_rgba(255,255,255,0.8)] border-0';
      default:
        return 'bg-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] border border-white/50';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-xs font-black text-clay-secondary uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-clay-primary">
            <span className="material-symbols-outlined">{icon}</span>
          </div>
        )}
        <motion.input
          className={`w-full rounded-[1.25rem] px-6 py-4 font-medium placeholder:text-clay-secondary/30 focus:outline-none focus:ring-2 focus:ring-clay-primary/50 ${getVariantStyles()} ${icon ? 'pl-12' : ''} ${error ? 'border-red-300' : ''}`}
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          {...props}
        />
      </div>
      {error && (
        <motion.p 
          className="text-xs font-bold text-red-500"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default ClayInput;

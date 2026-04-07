import React from 'react';
import { motion } from 'framer-motion';

const ClayButton = ({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'medium',
  icon,
  disabled = false,
  onClick,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-clay-primary text-white shadow-[6px_6px_12px_rgba(12,204,72,0.3),-2px_-2px_8px_rgba(255,255,255,0.2),inset_2px_2px_4px_rgba(255,255,255,0.3)]';
      case 'neutral':
        return 'bg-clay-neutral text-[#4a1d4a] shadow-[6px_6px_12px_rgba(233,183,255,0.4),-2px_-2px_8px_rgba(255,255,255,1)]';
      case 'tertiary':
        return 'bg-clay-tertiary text-clay-secondary shadow-[6px_6px_12px_rgba(154,253,210,0.4),-2px_-2px_8px_rgba(255,255,255,1)]';
      case 'secondary':
        return 'bg-clay-secondary text-white shadow-[6px_6px_12px_rgba(60,134,66,0.3),-2px_-2px_8px_rgba(255,255,255,0.2)]';
      default:
        return 'bg-white text-clay-secondary shadow-[6px_6px_12px_rgba(12,204,72,0.2),-6px_-6px_12px_rgba(255,255,255,1)]';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'px-4 py-2 text-sm';
      case 'large':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  return (
    <motion.button
      className={`rounded-[1.25rem] font-bold transition-all ${getVariantStyles()} ${getSizeStyles()} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && <span className="material-symbols-outlined">{icon}</span>}
        {children}
      </div>
    </motion.button>
  );
};

export default ClayButton;

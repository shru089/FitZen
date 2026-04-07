import React from 'react';
import { motion } from 'framer-motion';

const ClayCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  onClick,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'inset':
        return 'bg-[#f7fcf8] shadow-[inset_6px_6px_12px_rgba(12,204,72,0.1),inset_-6px_-6px_12px_rgba(255,255,255,0.8)]';
      case 'primary':
        return 'bg-clay-primary text-white shadow-[12px_12px_24px_rgba(12,204,72,0.3),-4px_-4px_12px_rgba(255,255,255,0.1),inset_8px_8px_20px_rgba(255,255,255,0.2)]';
      case 'neutral':
        return 'bg-clay-neutral shadow-[12px_12px_24px_rgba(233,183,255,0.4),-8px_-8px_16px_rgba(255,255,255,1)]';
      case 'tertiary':
        return 'bg-clay-tertiary shadow-[12px_12px_24px_rgba(154,253,210,0.3),-8px_-8px_16px_rgba(255,255,255,1)]';
      default:
        return 'bg-white shadow-[12px_12px_24px_rgba(60,134,66,0.15),-12px_-12px_24px_rgba(255,255,255,1)] border border-white/50';
    }
  };

  return (
    <motion.div
      className={`rounded-[2.5rem] p-6 ${getVariantStyles()} ${className}`}
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default ClayCard;

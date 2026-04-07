import React from 'react';
import { motion } from 'framer-motion';

const ClaySkeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '',
  variant = 'default',
  animate = true 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'card':
        return 'bg-white shadow-[12px_12px_24px_rgba(60,134,66,0.15),-12px_-12px_24px_rgba(255,255,255,1)] border border-white/50';
      case 'inset':
        return 'bg-[#f7fcf8] shadow-[inset_6px_6px_12px_rgba(12,204,72,0.1),inset_-6px_-6px_12px_rgba(255,255,255,0.8)]';
      case 'circle':
        return 'bg-white shadow-[6px_6px_12px_rgba(12,204,72,0.2),-6px_-6px_12px_rgba(255,255,255,1)] rounded-full';
      default:
        return 'bg-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] border border-white/50';
    }
  };

  const borderRadius = variant === 'circle' ? 'rounded-full' : variant === 'card' ? 'rounded-[2.5rem]' : 'rounded-[1.25rem]';

  if (animate) {
    return (
      <motion.div
        className={`${width} ${height} ${borderRadius} ${getVariantStyles()} ${className} bg-gradient-to-r from-clay-tertiary/20 via-clay-primary/20 to-clay-tertiary/20 bg-[length:200%_100%]`}
        animate={{
          backgroundPosition: ['200% 0%', '-200% 0%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    );
  }

  return (
    <div className={`${width} ${height} ${borderRadius} ${getVariantStyles()} ${className} bg-clay-tertiary/20`} />
  );
};

export const ClaySkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-[2.5rem] p-6 shadow-[12px_12px_24px_rgba(60,134,66,0.15),-12px_-12px_24px_rgba(255,255,255,1)] border border-white/50 ${className}`}>
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ClaySkeleton width="w-12" height="h-12" variant="circle" />
        <div className="flex-1 space-y-2">
          <ClaySkeleton width="w-3/4" height="h-4" />
          <ClaySkeleton width="w-1/2" height="h-3" />
        </div>
      </div>
      <ClaySkeleton width="w-full" height="h-20" variant="inset" />
    </div>
  </div>
);

export const ClaySkeletonProgress = ({ className = '' }) => (
  <div className={`bg-white rounded-[3.5rem] p-10 shadow-[24px_24px_48px_rgba(60,134,66,0.12),-16px_-16px_32px_rgba(255,255,255,1)] border border-white/60 ${className}`}>
    <div className="flex flex-col items-center gap-10">
      <ClaySkeleton width="w-56" height="h-56" variant="circle" />
      <div className="grid grid-cols-2 gap-5 w-full">
        <ClaySkeleton width="w-full" height="h-20" variant="inset" />
        <ClaySkeleton width="w-full" height="h-20" variant="inset" />
      </div>
    </div>
  </div>
);

export default ClaySkeleton;

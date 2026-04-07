import React from 'react';
import { motion } from 'framer-motion';

const strokeColors = {
  primary: '#0ccc48',
  secondary: '#3c8642',
  tertiary: '#9afdd2',
  neutral: '#e9b7ff'
};

const ClayProgressRing = ({ 
  progress = 75,
  size = 224,
  strokeWidth = 20,
  children,
  className = '',
  color = 'primary'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const strokeColor = strokeColors[color] ?? strokeColors.primary;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <motion.div 
        className="relative group cursor-pointer w-full h-full"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {/* Base deep inset for 3D depth */}
        <div className="absolute inset-2 bg-clay-tertiary/10 rounded-full shadow-[inset_6px_6px_12px_rgba(12,204,72,0.15),inset_-6px_-6px_12px_rgba(255,255,255,0.8)] border border-white/30"></div>
        
        <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle - always full */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#e8f5e8"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(12, 204, 72, 0.2))' }}
          />
        </svg>
        
        {children && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ClayProgressRing;

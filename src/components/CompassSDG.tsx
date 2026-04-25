import React from 'react';
import { motion } from 'motion/react';

const SDG_COLORS = [
  '#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21', 
  '#26BDE2', '#FCC30B', '#A21942', '#FD6925', '#DD1367', 
  '#FD9D24', '#BF8B2E', '#3F7E44', '#0A97D9', '#56C02B', 
  '#00689D', '#19486A'
];

interface CompassSDGProps {
  className?: string;
}

export const CompassSDG: React.FC<CompassSDGProps> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* SDG Color Ring */}
      <g>
        {SDG_COLORS.map((color, i) => {
          const angle = (360 / 17);
          const startAngle = i * angle;
          const endAngle = (i + 1) * angle;
          
          // Convert angles to radians
          const startRad = (startAngle - 90) * Math.PI / 180;
          const endRad = (endAngle - 90) * Math.PI / 180;
          
          const x1 = 50 + 45 * Math.cos(startRad);
          const y1 = 50 + 45 * Math.sin(startRad);
          const x2 = 50 + 45 * Math.cos(endRad);
          const y2 = 50 + 45 * Math.sin(endRad);
          
          return (
            <path
              key={i}
              d={`M 50 50 L ${x1} ${y1} A 45 45 0 0 1 ${x2} ${y2} Z`}
              fill={color}
            />
          );
        })}
      </g>
      
      {/* Inner White Circle */}
      <circle cx="50" cy="50" r="35" fill="white" />
      
      {/* Compass Needle with Animation */}
      <motion.g 
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        {/* North (Red) */}
        <path d="M 50 20 L 58 50 L 42 50 Z" fill="#E5243B" />
        {/* South (Dark Green/Black) */}
        <path d="M 50 80 L 58 50 L 42 50 Z" fill="#1A1A1A" />
        {/* Center Pin */}
        <circle cx="50" cy="50" r="3" fill="white" />
      </motion.g>
      
      {/* Outer Border */}
      <circle cx="50" cy="50" r="48" stroke="#004d33" strokeWidth="2" />
    </svg>
  );
};

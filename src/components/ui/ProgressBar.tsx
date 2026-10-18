import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 - 100+
  max?: number;
  color?: string; // Custom hex or tailwind class
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color,
  showLabel = false,
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const isOver = value > max;

  const sizeHeights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  // Determine fill color if not explicitly provided
  let fillColor = color || '#FAAE2B';
  if (!color) {
    if (isOver) fillColor = '#EF4444'; // Red if exceeded
    else if (percentage > 85) fillColor = '#F59E0B'; // Amber warning
    else fillColor = '#10B981'; // Green calm
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
          <span className="text-brand-darkMuted">Progress</span>
          <span className={isOver ? 'text-red-600 font-extrabold' : 'text-brand-dark'}>
            {Math.round(value)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full border border-brand-border/60 overflow-hidden ${sizeHeights[size]}`}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: isOver ? '#EF4444' : fillColor,
          }}
        />
      </div>
    </div>
  );
};

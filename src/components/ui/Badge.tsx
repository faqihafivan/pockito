import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'yellow' | 'coral' | 'mint' | 'lavender' | 'cyan' | 'dark' | 'gray';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'yellow',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantStyles = {
    yellow: 'bg-brand-primary/20 text-brand-dark border border-brand-primary/40 font-bold',
    coral: 'bg-[#FF7A59]/15 text-[#D94824] border border-[#FF7A59]/30 font-bold',
    mint: 'bg-[#10B981]/15 text-[#047857] border border-[#10B981]/30 font-bold',
    lavender: 'bg-[#8B5CF6]/15 text-[#6D28D9] border border-[#8B5CF6]/30 font-bold',
    cyan: 'bg-[#0EA5E9]/15 text-[#0284C7] border border-[#0EA5E9]/30 font-bold',
    dark: 'bg-brand-dark text-white border border-brand-dark font-bold',
    gray: 'bg-gray-100 text-gray-700 border border-gray-200 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

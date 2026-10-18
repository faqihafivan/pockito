import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'saweria' | 'flat' | 'subtle';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'saweria',
  hoverable = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    saweria: 'bg-white border-2 border-brand-dark shadow-saweria',
    flat: 'bg-white border border-brand-border shadow-sm',
    subtle: 'bg-brand-cream/80 border border-brand-border/60',
  };

  const hoverStyles = hoverable
    ? 'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-saweria-lg cursor-pointer'
    : '';

  return (
    <div
      className={`rounded-2xl p-5 ${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

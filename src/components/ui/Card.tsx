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
    saweria:
      'bg-brand-card dark:bg-slate-800 border-2 border-brand-dark dark:border-slate-700 shadow-saweria text-brand-dark dark:text-slate-100',
    flat:
      'bg-brand-card dark:bg-slate-800 border border-brand-border dark:border-slate-700 shadow-sm text-brand-dark dark:text-slate-100',
    subtle:
      'bg-brand-cream/80 dark:bg-slate-900 border border-brand-border/60 dark:border-slate-800 text-brand-dark dark:text-slate-100',
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

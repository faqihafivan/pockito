import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-brand-primary text-brand-dark hover:bg-brand-primaryHover border-2 border-brand-dark shadow-saweria hover:shadow-saweria-lg active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-saweria-sm',
    secondary:
      'bg-white text-brand-dark hover:bg-brand-cream border-2 border-brand-dark shadow-saweria hover:shadow-saweria-lg active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-saweria-sm',
    outline:
      'bg-transparent text-brand-dark hover:bg-black/5 border-2 border-brand-borderDark/40 hover:border-brand-dark',
    dark:
      'bg-brand-dark text-white hover:bg-black border-2 border-brand-dark shadow-saweria active:translate-x-[1.5px] active:translate-y-[1.5px]',
    danger:
      'bg-red-500 text-white hover:bg-red-600 border-2 border-brand-dark shadow-saweria active:translate-x-[1.5px] active:translate-y-[1.5px]',
    ghost:
      'bg-transparent text-brand-dark hover:bg-black/5 border-2 border-transparent',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};

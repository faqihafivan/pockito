import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full text-left">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-brand-darkMuted">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`w-full bg-white text-brand-dark placeholder:text-gray-400 font-medium text-sm rounded-xl border-2 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightIcon ? 'pr-10' : 'pr-3.5'} py-2.5 ${
              error
                ? 'border-red-500 focus:border-red-600 focus:shadow-[2px_2px_0px_#EF4444]'
                : 'border-brand-border focus:border-brand-dark focus:shadow-saweria-sm'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-brand-darkMuted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-1 text-xs font-semibold text-red-600">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="mt-1 text-xs text-brand-darkMuted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

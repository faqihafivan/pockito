import React from 'react';
import { formatIDR, parseIDRInput, MAX_SAFE_IDR } from '../../domain/finance/financialEngine';

export interface CurrencyInputProps {
  id?: string;
  label?: string;
  value: number; // Raw integer amount
  onValueChange: (value: number) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  max?: number;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  label,
  value,
  onValueChange,
  error,
  helperText,
  placeholder = 'Rp 0',
  disabled = false,
  className = '',
  max = MAX_SAFE_IDR,
}) => {
  const inputId = id || (label ? `currency-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : 'currency-input');
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const displayValue = value > 0 ? formatIDR(value) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const parsed = parseIDRInput(rawVal);
    const clamped = Math.min(max, parsed);
    onValueChange(clamped);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const parsed = parseIDRInput(pasted);
    const clamped = Math.min(max, parsed);
    onValueChange(clamped);
  };

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
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          value={displayValue}
          onChange={handleChange}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full bg-white text-brand-dark font-bold text-base tabular-nums rounded-xl border-2 transition-all duration-150 outline-none px-4 py-2.5 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 ${
            error
              ? 'border-red-500 focus:border-red-600 focus:shadow-[2px_2px_0px_#EF4444]'
              : 'border-brand-border focus:border-brand-dark focus:shadow-saweria-sm'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''} ${className}`}
        />
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
};

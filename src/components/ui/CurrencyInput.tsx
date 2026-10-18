import React from 'react';
import { formatIDR, parseIDRInput } from '../../domain/finance/financialEngine';

export interface CurrencyInputProps {
  label?: string;
  value: number; // Raw integer amount
  onValueChange: (value: number) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onValueChange,
  error,
  helperText,
  placeholder = 'Rp 0',
  disabled = false,
  className = '',
}) => {
  const displayValue = value > 0 ? formatIDR(value) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const parsed = parseIDRInput(rawVal);
    onValueChange(parsed);
  };

  return (
    <div className="w-full text-left">
      {label && (
        <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-white text-brand-dark font-bold text-base tabular-nums rounded-xl border-2 transition-all duration-150 outline-none px-4 py-2.5 ${
            error
              ? 'border-red-500 focus:border-red-600 focus:shadow-[2px_2px_0px_#EF4444]'
              : 'border-brand-border focus:border-brand-dark focus:shadow-saweria-sm'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''} ${className}`}
        />
      </div>
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-brand-darkMuted">{helperText}</p>}
    </div>
  );
};

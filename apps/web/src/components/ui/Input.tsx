import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-neutral-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3.5 text-neutral-400 pointer-events-none flex items-center">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full py-2.5 rounded-xl editorial-input text-sm text-neutral-100 placeholder:text-neutral-500 transition-all ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${
            error ? '!border-rose-500/80 !ring-rose-500/20' : ''
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3.5 text-neutral-400 flex items-center">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-neutral-400 mt-1">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';


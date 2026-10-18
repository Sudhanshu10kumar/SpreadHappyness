import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-medium text-neutral-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`w-full p-3.5 rounded-xl editorial-input text-sm text-neutral-100 placeholder:text-neutral-500 transition-all resize-y ${
          error ? '!border-rose-500/80 !ring-rose-500/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-neutral-400 mt-1">{helperText}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';


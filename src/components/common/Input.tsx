import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightElement, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-300 tracking-wide">
            {label}
            {props.required && <span className="text-rose-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400 shrink-0">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#0c111a] border text-slate-100 placeholder-slate-500 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0084FF]/40 focus:border-[#0084FF] disabled:opacity-50 disabled:bg-[#080b12] ${
              leftIcon ? 'pl-10' : ''
            } ${rightElement ? 'pr-12' : ''} ${
              error ? 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/30' : 'border-[#222d3d]'
            } ${className}`}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-rose-400 font-medium mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-2',
    md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2',
    lg: 'text-base px-5 py-3 min-h-[50px] gap-2.5 font-semibold',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#0084FF] hover:bg-[#0072de] text-white shadow-md shadow-blue-950/40 border border-blue-400/20 active:bg-[#0060be]',
    secondary:
      'bg-[#182130] hover:bg-[#202b3d] text-slate-200 border border-[#26344a] active:bg-[#141b27]',
    outline:
      'bg-transparent hover:bg-[#182130] text-slate-300 border border-[#2b3a52] hover:border-blue-500/60 active:bg-[#151c27]',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/40 border border-rose-400/30 active:bg-rose-700',
    ghost:
      'bg-transparent hover:bg-[#1a2333] text-slate-400 hover:text-slate-200 border border-transparent',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        icon && <span className="inline-flex items-center justify-center shrink-0">{icon}</span>
      )}
      <span className="inline-flex items-center justify-center leading-none">{children}</span>
    </button>
  );
};

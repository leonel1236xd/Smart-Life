import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  }[size];

  const variantClasses = {
    default: 'bg-[#182130] text-slate-300 border border-[#24334a]',
    primary: 'bg-blue-950/70 text-blue-300 border border-blue-500/30',
    success: 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-950/60 text-amber-300 border border-amber-500/30',
    danger: 'bg-rose-950/60 text-rose-300 border border-rose-500/30',
    outline: 'bg-transparent text-slate-300 border border-slate-700',
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-lg leading-none shrink-0 ${sizeClasses} ${variantClasses} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

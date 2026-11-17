import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-[#0f141f] border border-[#1b2535] ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#17202f] border border-[#24334a] flex items-center justify-center text-blue-400 mb-3.5 shadow-inner">
        {icon || <PackageOpen className="w-7 h-7" />}
      </div>
      <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
      <p className="text-sm text-slate-400 mt-1 max-w-sm leading-relaxed">{description}</p>
      {actionText && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

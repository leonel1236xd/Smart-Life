import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#1a2333]/70 ${className}`}
      aria-hidden="true"
    />
  );
};

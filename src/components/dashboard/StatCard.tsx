import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: 'blue' | 'emerald' | 'amber' | 'violet';
  loading?: boolean;
}

const accents = {
  blue: {
    iconBg: 'bg-blue-950/60 border-blue-500/20',
    iconText: 'text-blue-400',
    valueDot: 'bg-blue-400',
  },
  emerald: {
    iconBg: 'bg-emerald-950/60 border-emerald-500/20',
    iconText: 'text-emerald-400',
    valueDot: 'bg-emerald-400',
  },
  amber: {
    iconBg: 'bg-amber-950/60 border-amber-500/20',
    iconText: 'text-amber-400',
    valueDot: 'bg-amber-400',
  },
  violet: {
    iconBg: 'bg-violet-950/60 border-violet-500/20',
    iconText: 'text-violet-400',
    valueDot: 'bg-violet-400',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'blue',
  loading = false,
}) => {
  const accent = accents[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-3.5 p-4 rounded-xl bg-[#111722] border border-[#1c2738]"
    >
      <div
        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${accent.iconBg}`}
      >
        <Icon className={`w-5 h-5 ${accent.iconText}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">
          {title}
        </p>
        {loading ? (
          <Skeleton className="h-6 w-20 mt-1" />
        ) : (
          <p className="text-xl font-bold text-white tracking-tight leading-tight mt-0.5">
            {value}
          </p>
        )}
        {subtitle && !loading && (
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
};

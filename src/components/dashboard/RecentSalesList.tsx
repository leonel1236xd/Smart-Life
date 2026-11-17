import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, User, Clock, ChevronRight } from 'lucide-react';
import type { Sale } from '../../types';
import { formatDateBolivia, formatTimeBolivia } from '../../lib/timezone';
import { formatCurrency } from '../../lib/formatters';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';

interface RecentSalesListProps {
  sales: Sale[];
  loading: boolean;
  onSaleClick?: (sale: Sale) => void;
}

export const RecentSalesList: React.FC<RecentSalesListProps> = ({
  sales,
  loading,
  onSaleClick,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-[#111722] border border-[#1c2738]"
          >
            <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <EmptyState
        title="Sin ventas recientes"
        description="Las ventas que registres aparecerán aquí."
        icon={<ShoppingBag className="w-7 h-7" />}
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {sales.map((sale, index) => (
        <motion.div
          key={sale.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.04 }}
          onClick={() => onSaleClick && onSaleClick(sale)}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-[#111722] border border-[#1c2738] hover:border-blue-500/40 hover:bg-[#141c29] active:scale-[0.99] transition-all cursor-pointer group"
          title="Presiona para ver el detalle de la venta"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-950/50 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
              {sale.product_name}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-none">
                  {sale.profiles?.full_name || 'Empleado'}
                </span>
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-600" />
                {formatTimeBolivia(sale.created_at)}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0 flex items-center gap-2">
            <div>
              <p className="text-sm font-bold text-white">
                {sale.quantity} <span className="text-[11px] font-normal text-slate-400">ud.</span>
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold">
                {sale.total_amount ? formatCurrency(sale.total_amount) : formatDateBolivia(sale.created_at)}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

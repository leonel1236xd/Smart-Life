import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, User, Clock, Calendar, Trash2, ChevronRight } from 'lucide-react';
import type { Sale } from '../../types';
import { formatDateBolivia, formatTimeBolivia } from '../../lib/timezone';
import { formatCurrency } from '../../lib/formatters';

interface SaleCardProps {
  sale: Sale;
  index: number;
  showDelete?: boolean;
  onDelete?: (saleId: string) => void;
  onClick?: (sale: Sale) => void;
}

export const SaleCard: React.FC<SaleCardProps> = ({
  sale,
  index,
  showDelete = false,
  onDelete,
  onClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={() => onClick && onClick(sale)}
      className="p-4 rounded-xl bg-[#111722] border border-[#1c2738] space-y-3 cursor-pointer hover:border-blue-500/40 hover:bg-[#131b28] active:scale-[0.99] transition-all group"
    >
      {/* Header: producto + cantidad */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-950/50 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
              {sale.product_name}
            </p>
            {sale.notes && (
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{sale.notes}</p>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-white">
            {sale.quantity} <span className="text-[11px] font-normal text-slate-400">ud.</span>
          </p>
          {sale.total_amount !== null && (
            <p className="text-xs text-emerald-400 font-bold">{formatCurrency(sale.total_amount)}</p>
          )}
        </div>
      </div>

      {/* Footer: info y acciones */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#182030]">
        <div className="flex items-center gap-3 flex-wrap text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-slate-500" />
            {sale.profiles?.full_name || 'Empleado'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            {formatDateBolivia(sale.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            {formatTimeBolivia(sale.created_at)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {showDelete && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(sale.id);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors active:scale-95"
              aria-label={`Eliminar venta de ${sale.product_name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
        </div>
      </div>
    </motion.div>
  );
};

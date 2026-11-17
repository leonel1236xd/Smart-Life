import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, Eye } from 'lucide-react';
import type { Sale } from '../../types';
import { formatDateBolivia, formatTimeBolivia } from '../../lib/timezone';
import { formatCurrency } from '../../lib/formatters';
import { EmptyState } from '../common/EmptyState';
import { Skeleton } from '../common/Skeleton';

interface SalesTableProps {
  sales: Sale[];
  loading: boolean;
  showDelete?: boolean;
  onDelete?: (saleId: string) => void;
  onClick?: (sale: Sale) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  loading,
  showDelete = false,
  onDelete,
  onClick,
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl bg-[#111722] border border-[#1c2738] overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <EmptyState
        title="Sin ventas registradas"
        description="No se encontraron ventas con los filtros seleccionados."
        icon={<ShoppingBag className="w-7 h-7" />}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl bg-[#111722] border border-[#1c2738] overflow-hidden shadow-lg shadow-black/20"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1c2738] bg-[#0d121c]/70">
              <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Producto
              </th>
              <th className="text-center py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Cant.
              </th>
              <th className="text-right py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                P. Unit.
              </th>
              <th className="text-right py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total
              </th>
              <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Empleado
              </th>
              <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Fecha
              </th>
              <th className="text-left py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Hora
              </th>
              <th className="text-right py-3.5 px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale, index) => (
              <motion.tr
                key={sale.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: index * 0.02 }}
                onClick={() => onClick && onClick(sale)}
                className="border-b border-[#151d2a] last:border-b-0 hover:bg-[#182333]/70 active:bg-[#1a2638] transition-colors cursor-pointer group"
                title="Presiona para ver el detalle completo de la venta"
              >
                <td className="py-3.5 px-4">
                  <div className="max-w-[220px]">
                    <p className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                      {sale.product_name}
                    </p>
                    {sale.notes && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{sale.notes}</p>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-white">{sale.quantity}</td>
                <td className="py-3.5 px-4 text-right text-slate-300">
                  {sale.unit_price !== null ? (
                    formatCurrency(sale.unit_price)
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">
                  {sale.total_amount !== null ? (
                    formatCurrency(sale.total_amount)
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-slate-300">{sale.profiles?.full_name || '—'}</td>
                <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                  {formatDateBolivia(sale.created_at)}
                </td>
                <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                  {formatTimeBolivia(sale.created_at)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick && onClick(sale);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-950/40 transition-colors"
                      title="Ver detalle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {showDelete && onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(sale.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors active:scale-95"
                        title={`Eliminar venta de ${sale.product_name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

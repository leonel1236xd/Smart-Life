import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  Users,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import { Skeleton } from '../common/Skeleton';
import { CommissionsDetailModal } from './CommissionsDetailModal';
import { CATEGORIES_CONFIG } from '../../lib/commissions';
import type { DailyCommissionsResult, EmployeeCommissionSummary, ProductCategory, Sale } from '../../types';

interface CommissionsSummaryCardProps {
  loading: boolean;
  commissionsData: DailyCommissionsResult;
  mySummary: EmployeeCommissionSummary | null;
  isAdmin: boolean;
  currentUserId?: string;
  onSaleClick?: (sale: Sale) => void;
}

export const CommissionsSummaryCard: React.FC<CommissionsSummaryCardProps> = ({
  loading,
  commissionsData,
  mySummary,
  isAdmin,
  currentUserId,
  onSaleClick,
}) => {
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-[#111722] border border-[#1c2738]">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Vista para Empleado
  if (!isAdmin) {
    const totalComision = mySummary?.total_commission || 0;
    const totalArticulos = mySummary?.total_units || 0;

    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#141b17] via-[#101724] to-[#0c111a] border border-amber-500/30 shadow-lg shadow-black/20"
        >
          {/* Luz de fondo sutil */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-md shadow-amber-950/60 shrink-0">
                <div className="w-full h-full rounded-[10px] bg-[#120f06] flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Mi Comisión de Hoy
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Acumulado
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {formatCurrency(totalComision)}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({totalArticulos} {totalArticulos === 1 ? 'artículo' : 'artículos'} vendidos hoy)
                  </span>
                </div>

                {/* Desglose rápido */}
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-300 flex-wrap">
                  {Object.entries(mySummary?.category_units || {}).map(([catKey, qty]) => {
                    if (qty <= 0) return null;
                    const meta = CATEGORIES_CONFIG[catKey as ProductCategory];
                    return (
                      <span
                        key={catKey}
                        className="flex items-center gap-1.5 bg-[#141d2c] px-2.5 py-1 rounded-lg border border-[#223147]"
                      >
                        <span>{meta?.label || catKey}:</span>
                        <strong className="text-white">{qty} ud.</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDetailModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#172131] hover:bg-[#1e2b40] border border-[#283952] text-xs font-semibold text-slate-200 hover:text-white transition-all active:scale-95 shrink-0 self-stretch sm:self-center"
            >
              <span>Ver mis ventas de hoy</span>
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </motion.div>

        <CommissionsDetailModal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          commissionsData={commissionsData}
          isAdmin={false}
          currentUserId={currentUserId}
          onSaleClick={onSaleClick}
        />
      </>
    );
  }

  // Vista para Administrador
  const totalTienda = commissionsData.total_store_commission;
  const laptopsTienda = commissionsData.total_store_laptops;
  const accesoriosTienda = commissionsData.total_store_accesorios;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#111722] via-[#0d141e] to-[#0a0e16] border border-amber-500/30 shadow-lg shadow-black/20"
      >
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Encabezado del administrador */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-md shadow-amber-950/60 shrink-0">
              <div className="w-full h-full rounded-[10px] bg-[#120f06] flex items-center justify-center">
                <Coins className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Comisiones del Día
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {formatCurrency(totalTienda)}
                </span>
                <span className="text-xs text-slate-400">
                  ({commissionsData.total_store_units ?? (laptopsTienda + accesoriosTienda)} { (commissionsData.total_store_units ?? (laptopsTienda + accesoriosTienda)) === 1 ? 'artículo vendido hoy' : 'artículos vendidos hoy' })
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDetailModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#151f2e] hover:bg-[#1c2a3e] border border-[#24344c] text-xs font-semibold text-slate-200 hover:text-white transition-all active:scale-95 shrink-0 self-stretch sm:self-center"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Auditar todas las ventas de hoy</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </motion.div>

      <CommissionsDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        commissionsData={commissionsData}
        isAdmin={true}
        currentUserId={currentUserId}
        onSaleClick={onSaleClick}
      />
    </>
  );
};

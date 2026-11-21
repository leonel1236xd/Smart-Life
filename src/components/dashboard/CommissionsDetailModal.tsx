import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Coins,
  Laptop,
  Headphones,
  Monitor,
  Wrench,
  Printer,
  Tablet,
  User,
  Clock,
  Package,
  Users,
  ShoppingBag,
} from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import { formatTimeBolivia } from '../../lib/timezone';
import { getSaleCategory, getSaleCommission, CATEGORIES_CONFIG } from '../../lib/commissions';
import type { DailyCommissionsResult, ProductCategory, Sale } from '../../types';

interface CommissionsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  commissionsData: DailyCommissionsResult;
  isAdmin: boolean;
  currentUserId?: string;
  onSaleClick?: (sale: Sale) => void;
}

export const CommissionsDetailModal: React.FC<CommissionsDetailModalProps> = ({
  isOpen,
  onClose,
  commissionsData,
  isAdmin,
  currentUserId,
  onSaleClick,
}) => {
  // Para el admin: permitir filtrar por empleado específico o ver todos
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');

  const employees = commissionsData.employee_list;

  // Filtrar las ventas a mostrar
  const activeEmployee =
    selectedEmployeeId !== 'all'
      ? commissionsData.by_employee[selectedEmployeeId]
      : null;

  // Si no es admin, solo ve sus propias ventas
  const mySummary = currentUserId
    ? commissionsData.by_employee[currentUserId]
    : null;

  const displayedSales: Sale[] = !isAdmin
    ? mySummary?.sales || []
    : selectedEmployeeId === 'all'
    ? employees.flatMap((emp) => emp.sales)
    : activeEmployee?.sales || [];

  // Totales de la vista actual
  const currentTotalCommission = !isAdmin
    ? mySummary?.total_commission || 0
    : selectedEmployeeId === 'all'
    ? commissionsData.total_store_commission
    : activeEmployee?.total_commission || 0;

  const currentTotalUnits = !isAdmin
    ? mySummary?.total_units || 0
    : selectedEmployeeId === 'all'
    ? commissionsData.total_store_units ?? displayedSales.reduce((acc, s) => acc + (s.quantity || 1), 0)
    : activeEmployee?.total_units || 0;

  const getCategoryIcon = (cat: ProductCategory) => {
    switch (cat) {
      case 'laptop':
        return <Laptop className="w-4 h-4" />;
      case 'monitor':
        return <Monitor className="w-4 h-4" />;
      case 'servicio_tecnico':
        return <Wrench className="w-4 h-4" />;
      case 'impresora':
        return <Printer className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Headphones className="w-4 h-4" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Auditoría de Comisiones del Día"
      subtitle="Verifica que las comisiones de hoy cuadren exactamente"
    >
      <div className="space-y-4">
        {/* Selector de empleado (Solo para administradores) */}
        {isAdmin && employees.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Filtrar por empleado:
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedEmployeeId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedEmployeeId === 'all'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/50'
                    : 'bg-[#0f141f] border border-[#1e2a3c] text-slate-400 hover:text-white'
                }`}
              >
                Todos ({commissionsData.employee_list.length})
              </button>
              {employees.map((emp) => (
                <button
                  key={emp.employee_id}
                  type="button"
                  onClick={() => setSelectedEmployeeId(emp.employee_id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                    selectedEmployeeId === emp.employee_id
                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-900/50'
                      : 'bg-[#0f141f] border border-[#1e2a3c] text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{emp.employee_name}</span>
                  <span className="text-[10px] opacity-80 font-mono">
                    ({formatCurrency(emp.total_commission)})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tarjetas resumen de la selección */}
        <div className="grid grid-cols-3 gap-2">
          {/* Total comisión */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-950/60 to-[#121008] border border-amber-500/40 text-center">
            <span className="text-[10px] text-amber-300/80 uppercase font-semibold flex items-center justify-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              Comisión Total
            </span>
            <p className="text-base sm:text-lg font-black text-amber-300 mt-0.5">
              {formatCurrency(currentTotalCommission)}
            </p>
          </div>

          {/* Artículos con comisión */}
          <div className="p-3 rounded-xl bg-[#0f1520] border border-[#223044] text-center">
            <span className="text-[10px] text-slate-300 uppercase font-semibold flex items-center justify-center gap-1">
              <Package className="w-3 h-3 text-emerald-400" />
              Artículos
            </span>
            <p className="text-base sm:text-lg font-bold text-white mt-0.5">
              {currentTotalUnits} <span className="text-xs font-normal text-slate-400">ud.</span>
            </p>
            <p className="text-[10px] text-slate-400">Total vendidos</p>
          </div>

          {/* Ventas registradas */}
          <div className="p-3 rounded-xl bg-[#0f1520] border border-[#223044] text-center">
            <span className="text-[10px] text-slate-300 uppercase font-semibold flex items-center justify-center gap-1">
              <ShoppingBag className="w-3 h-3 text-blue-400" />
              Ventas
            </span>
            <p className="text-base sm:text-lg font-bold text-white mt-0.5">
              {displayedSales.length}
            </p>
            <p className="text-[10px] text-slate-400">Registros de hoy</p>
          </div>
        </div>

        {/* Listado detallado de ventas que generan comisión */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Ventas registradas hoy ({displayedSales.length})
            </p>
            <span className="text-[11px] text-slate-500">
              {displayedSales.length > 0 ? 'Toca una venta para ver más' : ''}
            </span>
          </div>

          {displayedSales.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-[#090d14] border border-[#1b2535]">
              <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">Sin comisiones registradas hoy</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Las ventas y servicios registrados hoy aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {displayedSales.map((sale) => {
                const category = getSaleCategory(sale);
                const commission = getSaleCommission(sale);
                const meta = CATEGORIES_CONFIG[category] || CATEGORIES_CONFIG.accesorio;

                return (
                  <div
                    key={sale.id}
                    onClick={() => onSaleClick && onSaleClick(sale)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0b1018] border border-[#1a2536] hover:border-blue-500/40 hover:bg-[#101724] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#141d2c] border border-[#233146] text-amber-300">
                        {getCategoryIcon(category)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-blue-300">
                            {sale.product_name}
                          </p>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {formatTimeBolivia(sale.created_at)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400 truncate max-w-[120px] sm:max-w-none">
                            <User className="w-3 h-3 text-slate-500" />
                            {sale.profiles?.full_name || 'Empleado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="text-xs sm:text-sm font-black text-amber-300">
                        +{formatCurrency(commission)}
                      </span>
                      <p className="text-[10px] text-slate-500">
                        {sale.quantity} {Number(sale.quantity) === 1 ? 'ud.' : 'uds.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botón cerrar */}
        <div className="pt-1">
          <Button type="button" variant="secondary" onClick={onClose} className="w-full min-h-[44px]">
            Cerrar detalle
          </Button>
        </div>
      </div>
    </Modal>
  );
};

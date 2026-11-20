import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Hash,
  DollarSign,
  User,
  Calendar,
  Clock,
  FileText,
  Trash2,
  Pencil,
  Receipt,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Coins,
  Laptop,
  Headphones,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ConfirmModal } from '../common/ConfirmModal';
import { formatCurrency } from '../../lib/formatters';
import { formatDateBolivia, formatTimeBolivia } from '../../lib/timezone';
import { getSaleCategory, getSaleCommission } from '../../lib/commissions';
import type { Sale } from '../../types';

interface SaleDetailModalProps {
  isOpen: boolean;
  sale: Sale | null;
  onClose: () => void;
  canDelete?: boolean;
  onDelete?: (saleId: string) => void;
  canEdit?: boolean;
  onEdit?: (sale: Sale) => void;
}

export const SaleDetailModal: React.FC<SaleDetailModalProps> = ({
  isOpen,
  sale,
  onClose,
  canDelete = false,
  onDelete,
  canEdit = false,
  onEdit,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showDeleteConfirm) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      setShowDeleteConfirm(false);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, showDeleteConfirm]);

  if (!sale) return null;

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(sale.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal animado */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 25 }}
              className="relative w-full max-w-lg bg-[#0f141f] border border-[#223045] rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[92dvh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-[#1b2535]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      Detalle de Venta
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-mono text-slate-400">
                      ID: #{sale.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a2333] transition-colors active:scale-95"
                  aria-label="Cerrar ventana"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido scrolleable */}
              <div className="px-4 sm:px-6 py-4 overflow-y-auto space-y-3.5">
                {/* Banner de Total */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#121c2c] to-[#0c131e] border border-blue-500/25 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Total de la Operación
                    </span>
                    <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-0.5 tracking-tight">
                      {sale.total_amount ? formatCurrency(sale.total_amount) : 'Sin precio'}
                    </p>
                  </div>
                  <Badge variant="success" size="md">
                    Venta Confirmada
                  </Badge>
                </div>

                {/* Ficha de producto y cantidad */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#090d14] border border-[#1b2535] space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#16202e] border border-[#23334a] flex items-center justify-center text-blue-400 shrink-0">
                      {getSaleCategory(sale) === 'laptop' ? (
                        <Laptop className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                      ) : (
                        <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">
                          Producto / Accesorio
                        </p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                          getSaleCategory(sale) === 'laptop'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                            : 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                        }`}>
                          {getSaleCategory(sale) === 'laptop' ? 'Laptop (+50 Bs./ud)' : 'Accesorio (+5 Bs./ud)'}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base font-bold text-white mt-0.5 break-words">
                        {sale.product_name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-[#16202e]">
                    <div>
                      <span className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-slate-500" /> Cantidad
                      </span>
                      <p className="text-sm sm:text-base font-bold text-slate-100 mt-0.5">
                        {sale.quantity} <span className="text-xs font-normal text-slate-400">ud.</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-slate-500" /> P. Unitario
                      </span>
                      <p className="text-sm sm:text-base font-bold text-slate-100 mt-0.5">
                        {sale.unit_price ? formatCurrency(sale.unit_price) : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Comisión del vendedor por esta venta */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-1.5 text-xs text-amber-200 font-semibold">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>Comisión para el vendedor:</span>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-amber-300">
                      +{formatCurrency(getSaleCommission(sale))}
                    </span>
                  </div>
                </div>

                {/* Datos de Empleado y Fecha/Hora */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#090d14] border border-[#1b2535] space-y-3">
                  {/* Empleado */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400">Registrado por</p>
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">
                          {sale.profiles?.full_name || 'Empleado del sistema'}
                        </p>
                      </div>
                    </div>

                    {sale.profiles && (
                      <Badge
                        variant={sale.profiles.role === 'admin' ? 'primary' : 'default'}
                        size="sm"
                        icon={
                          sale.profiles.role === 'admin' ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : (
                            <Shield className="w-3 h-3" />
                          )
                        }
                      >
                        {sale.profiles.role === 'admin' ? 'Admin' : 'Empleado'}
                      </Badge>
                    )}
                  </div>

                  {/* Fecha y Hora en Bolivia */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-[#16202e] text-xs">
                    <div>
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-500" /> Fecha (Bolivia)
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5">
                        {formatDateBolivia(sale.created_at)}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500" /> Hora exacta
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5">
                        {formatTimeBolivia(sale.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notas (si existen) */}
                {sale.notes && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#090d14] border border-[#1b2535]">
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                      <FileText className="w-3.5 h-3.5 text-slate-500" /> Notas u Observaciones
                    </p>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words bg-[#121924] p-2.5 sm:p-3 rounded-xl border border-[#1d2737]">
                      {sale.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer de Acciones */}
              <div className="flex items-center justify-between gap-2.5 px-4 sm:px-6 py-3.5 border-t border-[#1b2535] bg-[#0c111a]">
                <div className="flex items-center gap-2">
                  {canEdit && onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEdit(sale);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-400 hover:text-blue-200 hover:bg-blue-950/40 border border-blue-500/30 transition-colors active:scale-95"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Modificar
                    </button>
                  )}

                  {canDelete && onDelete && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 border border-rose-500/30 transition-colors active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  )}
                </div>

                <Button variant="primary" size="md" onClick={onClose} className="min-w-[100px]">
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación estilizado para eliminar venta */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="¿Eliminar esta venta?"
        description={
          <p>
            Estás a punto de eliminar la venta de{' '}
            <span className="font-semibold text-white">"{sale.product_name}"</span>. Esta acción no se
            puede deshacer y restará el monto del total de ventas.
          </p>
        }
        variant="danger"
        icon={<AlertTriangle className="w-6 h-6 text-rose-400" />}
        confirmText="Eliminar Registro"
        cancelText="Conservar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Package,
  Hash,
  DollarSign,
  User,
  Calendar,
  Clock,
  PlusCircle,
  Check,
  Receipt,
} from 'lucide-react';
import { Button } from '../common/Button';
import { formatCurrency } from '../../lib/formatters';
import { formatDateBolivia, formatTimeBolivia } from '../../lib/timezone';
import type { Sale } from '../../types';

interface SaleSuccessModalProps {
  isOpen: boolean;
  sale: Sale | null;
  onClose: () => void;
  onRegisterAnother: () => void;
}

export const SaleSuccessModal: React.FC<SaleSuccessModalProps> = ({
  isOpen,
  sale,
  onClose,
  onRegisterAnother,
}) => {
  // Manejar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!sale) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop con desenfoque suave */}
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
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 24,
            }}
            className="relative w-full max-w-md bg-[#0f141f] border border-[#223045] rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col p-4 sm:p-7 max-h-[92dvh] overflow-y-auto"
          >
            {/* Halo de luz de fondo */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-28 bg-emerald-500/15 blur-3xl pointer-events-none rounded-full" />

            {/* Icono de éxito animado */}
            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 18,
                  delay: 0.1,
                }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-950/60 flex items-center justify-center mb-3"
              >
                <div className="w-full h-full rounded-[14px] bg-[#0b1612] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-400" />
                </div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="text-lg sm:text-xl font-bold text-white tracking-tight"
              >
                ¡Venta Registrada con Éxito!
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.22 }}
                className="text-xs text-slate-400 mt-1 max-w-xs"
              >
                La transacción ha sido guardada y el resumen se actualizó automáticamente.
              </motion.p>
            </div>

            {/* Comprobante / Voucher visual */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-[#090d14] border border-[#1b2637] relative overflow-hidden space-y-3"
            >
              {/* Encabezado del comprobante */}
              <div className="flex items-center justify-between pb-2 border-b border-dashed border-[#1c293c]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Receipt className="w-4 h-4 text-blue-400" />
                  Comprobante de Venta
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  ID: #{sale.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              {/* Producto */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-950/50 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Package className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Producto</p>
                  <p className="text-sm font-bold text-white truncate">{sale.product_name}</p>
                </div>
              </div>

              {/* Fila de detalles: Cantidad, Precio Unitario, Total */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#141d2a]">
                <div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-0.5">
                    <Hash className="w-3 h-3" /> Cant.
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5">
                    {sale.quantity} <span className="text-[10px] text-slate-400">ud.</span>
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-0.5">
                    <DollarSign className="w-3 h-3" /> Unitario
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5">
                    {sale.unit_price ? formatCurrency(sale.unit_price) : '—'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-medium">Total</p>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-400 mt-0.5">
                    {sale.total_amount ? formatCurrency(sale.total_amount) : '—'}
                  </p>
                </div>
              </div>

              {/* Info Empleado y Fecha */}
              <div className="pt-2 border-t border-dashed border-[#1c293c] flex items-center justify-between text-[10px] text-slate-400 flex-wrap gap-1">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-500" />
                  {sale.profiles?.full_name || 'Empleado'}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3 h-3" />
                  {formatDateBolivia(sale.created_at)}
                  <Clock className="w-3 h-3 ml-1" />
                  {formatTimeBolivia(sale.created_at)}
                </span>
              </div>
            </motion.div>

            {/* Acciones */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-5 flex flex-col sm:flex-row gap-2"
            >
              <Button
                variant="secondary"
                size="md"
                onClick={onClose}
                icon={<Check className="w-4 h-4" />}
                className="flex-1 min-h-[44px]"
              >
                Aceptar
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={onRegisterAnother}
                icon={<PlusCircle className="w-4 h-4" />}
                className="flex-1 min-h-[44px]"
              >
                Registrar otra venta
              </Button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

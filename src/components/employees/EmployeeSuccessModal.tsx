import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, User, Mail, Shield, ShieldCheck, Check, UserPlus } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import type { CreateEmployeeInput } from '../../lib/admin';

interface EmployeeSuccessModalProps {
  isOpen: boolean;
  employeeData: CreateEmployeeInput | null;
  onClose: () => void;
  onCreateAnother: () => void;
}

export const EmployeeSuccessModal: React.FC<EmployeeSuccessModalProps> = ({
  isOpen,
  employeeData,
  onClose,
  onCreateAnother,
}) => {
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

  if (!employeeData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="relative w-full max-w-md bg-[#0f141f] border border-[#223045] rounded-3xl shadow-2xl z-10 overflow-hidden p-6 sm:p-7 text-center"
          >
            {/* Halo esmeralda */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/15 blur-3xl pointer-events-none rounded-full" />

            {/* Icono animado */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20, delay: 0.08 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-950/60 flex items-center justify-center mx-auto mb-3.5"
            >
              <div className="w-full h-full rounded-[14px] bg-[#0b1612] flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>
            </motion.div>

            <h3 className="text-xl font-bold text-white tracking-tight">
              ¡Empleado Creado con Éxito!
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              La cuenta fue habilitada inmediatamente en el sistema.
            </p>

            {/* Ficha resumen del empleado */}
            <div className="mt-5 p-4 rounded-2xl bg-[#090d14] border border-[#1b2637] text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Nombre Completo</p>
                  <p className="text-sm font-bold text-white truncate">{employeeData.full_name}</p>
                </div>
                <Badge
                  variant={employeeData.role === 'admin' ? 'primary' : 'default'}
                  size="sm"
                  icon={
                    employeeData.role === 'admin' ? (
                      <ShieldCheck className="w-3 h-3" />
                    ) : (
                      <Shield className="w-3 h-3" />
                    )
                  }
                >
                  {employeeData.role === 'admin' ? 'Admin' : 'Empleado'}
                </Badge>
              </div>

              <div className="pt-2.5 border-t border-[#16202e] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> Correo de acceso:
                  </span>
                  <span className="font-semibold text-slate-100">{employeeData.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Estado:
                  </span>
                  <span className="font-semibold text-emerald-400">Habilitado para ingresar</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <Button
                variant="secondary"
                size="md"
                onClick={onClose}
                icon={<Check className="w-4 h-4" />}
                className="flex-1"
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={onCreateAnother}
                icon={<UserPlus className="w-4 h-4" />}
                className="flex-1"
              >
                Crear otro
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

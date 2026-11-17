import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  icon?: React.ReactNode;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  icon,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onCancel();
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
  }, [isOpen, onCancel, loading]);

  const variantStyles = {
    danger: {
      iconBg: 'bg-rose-950/60 border-rose-500/30 text-rose-400',
      glow: 'bg-rose-500/10',
      confirmVariant: 'danger' as const,
      defaultIcon: <AlertCircle className="w-6 h-6" />,
    },
    warning: {
      iconBg: 'bg-amber-950/60 border-amber-500/30 text-amber-400',
      glow: 'bg-amber-500/10',
      confirmVariant: 'danger' as const,
      defaultIcon: <AlertTriangle className="w-6 h-6" />,
    },
    success: {
      iconBg: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400',
      glow: 'bg-emerald-500/10',
      confirmVariant: 'primary' as const,
      defaultIcon: <CheckCircle2 className="w-6 h-6" />,
    },
    primary: {
      iconBg: 'bg-blue-950/60 border-blue-500/30 text-blue-400',
      glow: 'bg-blue-500/10',
      confirmVariant: 'primary' as const,
      defaultIcon: <HelpCircle className="w-6 h-6" />,
    },
  }[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop con desenfoque suave */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !loading && onCancel()}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal animado */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative w-full max-w-md bg-[#0f141f] border border-[#223045] rounded-3xl shadow-2xl z-10 overflow-hidden p-6 sm:p-7 text-center"
          >
            {/* Halo suave de fondo */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 blur-3xl pointer-events-none rounded-full ${variantStyles.glow}`}
            />

            {/* Icono central con rebote suave */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
              className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-4 shadow-lg ${variantStyles.iconBg}`}
            >
              {icon || variantStyles.defaultIcon}
            </motion.div>

            {/* Título */}
            <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
              {title}
            </h3>

            {/* Descripción */}
            <div className="text-sm text-slate-300/90 mt-2 leading-relaxed">
              {description}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 mt-6 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={onCancel}
                disabled={loading}
                className="flex-1"
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                variant={variantStyles.confirmVariant}
                size="md"
                onClick={onConfirm}
                loading={loading}
                className="flex-1"
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

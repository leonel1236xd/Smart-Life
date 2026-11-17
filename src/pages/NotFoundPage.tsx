import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, LayoutDashboard } from 'lucide-react';
import { Button } from '../components/common/Button';

interface NotFoundPageProps {
  title?: string;
  description?: string;
  onBackToDashboard: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  title = 'Página o sección no encontrada',
  description = 'La ruta o módulo solicitado no existe o no cuentas con los permisos necesarios para acceder.',
  onBackToDashboard,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-md w-full text-center p-8 rounded-3xl bg-[#0f141f] border border-[#223045] shadow-2xl relative overflow-hidden"
      >
        {/* Halo de luz decorativo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-blue-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* Icono de error 404 / 403 */}
        <div className="w-16 h-16 rounded-2xl bg-blue-950/70 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-950/50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-500/25">
          Error 404 · No Encontrado
        </span>

        <h3 className="text-xl font-bold text-white tracking-tight mt-3">
          {title}
        </h3>

        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          {description}
        </p>

        <div className="mt-6 flex justify-center">
          <Button
            variant="primary"
            size="md"
            icon={<LayoutDashboard className="w-4 h-4" />}
            onClick={onBackToDashboard}
          >
            Volver al Resumen
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Plus,
  LogOut,
  UserCircle,
  X,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import logoImg from '../../assets/logo.jpg';

export type AppView = 'dashboard' | 'history' | 'employees';

interface AppLayoutProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onNewSale: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentView,
  onViewChange,
  onNewSale,
  children,
}) => {
  const { profile, signOut, isAdmin } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const navItems: { id: AppView; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'history', label: 'Historial', icon: ClipboardList },
    { id: 'employees', label: 'Empleados', icon: Users, adminOnly: true },
  ];

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const handleSignOut = async () => {
    setProfileModalOpen(false);
    await signOut();
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#0b0e14]">
      {/* ─── Header Superior ─── */}
      <header className="sticky top-0 z-40 bg-[#0b0e14]/95 backdrop-blur-md border-b border-[#181f2c]">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-3.5 sm:px-4">
          {/* Logo y Nombre */}
          <div className="flex items-center gap-2.5">
            <img
              src={logoImg}
              alt="Smart Life"
              className="w-8 h-8 rounded-lg object-cover shadow-sm shadow-blue-900/30"
            />
            <div>
              <h1 className="text-sm font-bold text-white leading-none tracking-tight">Smart Life</h1>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">Control de Ventas</p>
            </div>
          </div>

          {/* Nav desktop */}
          <nav className="hidden sm:flex items-center gap-1">
            {visibleNavItems.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors active:scale-[0.98] ${
                    active
                      ? 'bg-[#182130] text-white border border-[#26344a]'
                      : 'text-slate-400 hover:text-white hover:bg-[#131a25]'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Acciones derecha */}
          <div className="flex items-center gap-2">
            {/* Botón nueva venta desktop */}
            <button
              type="button"
              onClick={onNewSale}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0084FF] hover:bg-[#0072de] text-white text-sm font-semibold shadow-md shadow-blue-950/40 border border-blue-400/20 transition-colors active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Nueva venta
            </button>

            {/* Info del usuario desktop */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111722] border border-[#1c2738]">
              <UserCircle className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-300 max-w-[120px] truncate">{profile?.full_name}</span>
              {isAdmin && <Badge variant="primary" size="sm">Admin</Badge>}
            </div>

            {/* Cerrar sesión desktop */}
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1a2333] transition-colors active:scale-95"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Botón de perfil móvil en header */}
            <button
              type="button"
              onClick={() => setProfileModalOpen(true)}
              className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#111722] border border-[#1c2738] active:scale-95 transition-all"
              aria-label="Abrir perfil de usuario"
            >
              <UserCircle className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-slate-200 max-w-[90px] truncate">
                {profile?.full_name?.split(' ')[0] || 'Mi cuenta'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Contenido Principal ─── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-3.5 sm:px-4 py-4 sm:py-5 pb-24 sm:pb-8">
        {children}
      </main>

      {/* ─── Barra de Navegación Inferior Móvil (Estilo App Nativa) ─── */}
      <nav
        aria-label="Navegación móvil"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c1018]/95 backdrop-blur-xl border-t border-[#1a2333] shadow-[0_-10px_30px_rgba(0,0,0,0.7)] pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))] pt-1"
      >
        <div className="max-w-md mx-auto px-2 flex items-center justify-around h-15">
          {/* Caso 1: Administrador (5 elementos simétricos con Venta al centro) */}
          {isAdmin ? (
            <>
              {/* 1. Resumen */}
              <button
                type="button"
                onClick={() => onViewChange('dashboard')}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
                  currentView === 'dashboard' ? 'text-[#0084FF]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-[#0084FF]/15 text-[#0084FF]' : ''}`}>
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 ${currentView === 'dashboard' ? 'font-bold text-[#0084FF]' : 'font-medium text-slate-400'}`}>
                  Resumen
                </span>
                {currentView === 'dashboard' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0084FF] mt-0.5 shadow-[0_0_6px_#0084FF]" />
                )}
              </button>

              {/* 2. Historial */}
              <button
                type="button"
                onClick={() => onViewChange('history')}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
                  currentView === 'history' ? 'text-[#0084FF]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${currentView === 'history' ? 'bg-[#0084FF]/15 text-[#0084FF]' : ''}`}>
                  <ClipboardList className="w-5 h-5" />
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 ${currentView === 'history' ? 'font-bold text-[#0084FF]' : 'font-medium text-slate-400'}`}>
                  Historial
                </span>
                {currentView === 'history' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0084FF] mt-0.5 shadow-[0_0_6px_#0084FF]" />
                )}
              </button>

              {/* 3. HERO CENTRAL: Botón Nueva Venta */}
              <button
                type="button"
                onClick={onNewSale}
                className="flex flex-col items-center justify-center flex-1 -mt-5 group"
                aria-label="Registrar nueva venta"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0066d6] via-[#0084ff] to-[#38bdf8] flex items-center justify-center shadow-[0_4px_18px_rgba(0,132,255,0.45)] border-2 border-[#0c1018] group-active:scale-95 transition-transform text-white">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-blue-400 mt-1 tracking-tight">
                  Venta
                </span>
              </button>

              {/* 4. Empleados */}
              <button
                type="button"
                onClick={() => onViewChange('employees')}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
                  currentView === 'employees' ? 'text-[#0084FF]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${currentView === 'employees' ? 'bg-[#0084FF]/15 text-[#0084FF]' : ''}`}>
                  <Users className="w-5 h-5" />
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 ${currentView === 'employees' ? 'font-bold text-[#0084FF]' : 'font-medium text-slate-400'}`}>
                  Empleados
                </span>
                {currentView === 'employees' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0084FF] mt-0.5 shadow-[0_0_6px_#0084FF]" />
                )}
              </button>

              {/* 5. Perfil y Sesión */}
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="flex flex-col items-center justify-center flex-1 py-1 transition-all text-slate-400 hover:text-slate-200"
              >
                <div className="p-1 rounded-xl">
                  <UserCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-slate-400 tracking-tight mt-0.5">
                  Perfil
                </span>
              </button>
            </>
          ) : (
            /* Caso 2: Empleado no admin (3 elementos simétricos con Venta al centro) */
            <>
              {/* 1. Resumen */}
              <button
                type="button"
                onClick={() => onViewChange('dashboard')}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
                  currentView === 'dashboard' ? 'text-[#0084FF]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-[#0084FF]/15 text-[#0084FF]' : ''}`}>
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <span className={`text-[11px] tracking-tight mt-0.5 ${currentView === 'dashboard' ? 'font-bold text-[#0084FF]' : 'font-medium text-slate-400'}`}>
                  Resumen
                </span>
                {currentView === 'dashboard' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0084FF] mt-0.5 shadow-[0_0_6px_#0084FF]" />
                )}
              </button>

              {/* 2. HERO CENTRAL: Botón Nueva Venta */}
              <button
                type="button"
                onClick={onNewSale}
                className="flex flex-col items-center justify-center flex-1 -mt-5 group"
                aria-label="Registrar nueva venta"
              >
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#0066d6] via-[#0084ff] to-[#38bdf8] flex items-center justify-center shadow-[0_4px_18px_rgba(0,132,255,0.45)] border-2 border-[#0c1018] group-active:scale-95 transition-transform text-white">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-bold text-blue-400 mt-1 tracking-tight">
                  Nueva Venta
                </span>
              </button>

              {/* 3. Historial */}
              <button
                type="button"
                onClick={() => onViewChange('history')}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
                  currentView === 'history' ? 'text-[#0084FF]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${currentView === 'history' ? 'bg-[#0084FF]/15 text-[#0084FF]' : ''}`}>
                  <ClipboardList className="w-5 h-5" />
                </div>
                <span className={`text-[11px] tracking-tight mt-0.5 ${currentView === 'history' ? 'font-bold text-[#0084FF]' : 'font-medium text-slate-400'}`}>
                  Historial
                </span>
                {currentView === 'history' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0084FF] mt-0.5 shadow-[0_0_6px_#0084FF]" />
                )}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ─── Modal/Sheet de Perfil y Sesión en Móvil ─── */}
      <AnimatePresence>
        {profileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-[#111722] border border-[#222c3d] rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            >
              {/* Barra de arrastre visual para móvil */}
              <div className="w-12 h-1 bg-slate-700/60 rounded-full mx-auto mb-4 sm:hidden" />

              <div className="flex items-center justify-between pb-3 border-b border-[#1c2738]">
                <div className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">Mi Cuenta</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2332]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Datos del usuario */}
              <div className="py-4 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0b0e14] border border-[#1a2332]">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <UserCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{profile?.full_name}</p>
                    <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                      {profile?.email}
                    </p>
                  </div>
                  <Badge variant={isAdmin ? 'primary' : 'default'} size="sm">
                    {isAdmin ? 'Admin' : 'Empleado'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between px-3.5 py-2.5 text-xs text-slate-400 bg-[#0d121c] rounded-xl border border-[#1a2434]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Estado de cuenta
                  </span>
                  <span className="text-emerald-400 font-semibold">Activa</span>
                </div>
              </div>

              {/* Botón de cierre de sesión */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="danger"
                  icon={<LogOut className="w-4 h-4" />}
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Cerrar sesión
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

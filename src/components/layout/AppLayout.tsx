import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Plus,
  LogOut,
  Menu,
  X,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: AppView; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'history', label: 'Historial', icon: ClipboardList },
    { id: 'employees', label: 'Empleados', icon: Users, adminOnly: true },
  ];

  // Filtrar items según rol
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#0b0e14]">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 bg-[#0b0e14]/95 backdrop-blur-md border-b border-[#181f2c]">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img
              src={logoImg}
              alt="Smart Life"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-white leading-none tracking-tight">Smart Life</h1>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">Control de Ventas</p>
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
              <Plus className="w-4 h-4" />
              Nueva venta
            </button>

            {/* Info del usuario */}
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

            {/* Hamburger mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="sm:hidden border-t border-[#181f2c] px-4 py-3 space-y-1 bg-[#0b0e14]"
          >
            <div className="flex items-center gap-2 px-3 py-2 mb-2">
              <UserCircle className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300 truncate">{profile?.full_name}</span>
              {isAdmin && <Badge variant="primary" size="sm">Admin</Badge>}
            </div>

            {visibleNavItems.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onViewChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#182130] text-white border border-[#26344a]'
                      : 'text-slate-400 hover:text-white hover:bg-[#131a25]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors mt-2"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </motion.div>
        )}
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-5 pb-24 sm:pb-6">
        {children}
      </main>

      {/* ─── Mobile Bottom Bar ─── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0e14]/95 backdrop-blur-md border-t border-[#181f2c]">
        <div className="flex items-center justify-around h-16 px-2">
          {visibleNavItems.map((item) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors active:scale-95 ${
                  active ? 'text-[#0084FF]' : 'text-slate-500'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* Botón nueva venta central en móvil */}
          <button
            type="button"
            onClick={onNewSale}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[#0084FF] active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-[#0084FF] flex items-center justify-center shadow-lg shadow-blue-900/50 -mt-4">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-semibold">Venta</span>
          </button>
        </div>
      </div>
    </div>
  );
};

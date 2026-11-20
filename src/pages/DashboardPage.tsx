import React, { useMemo } from 'react';
import {
  ShoppingBag,
  Package,
  CalendarDays,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentSalesList } from '../components/dashboard/RecentSalesList';
import { CommissionsSummaryCard } from '../components/dashboard/CommissionsSummaryCard';
import { useStats } from '../hooks/useStats';
import { useSales } from '../hooks/useSales';
import { useDailyCommissions } from '../hooks/useDailyCommissions';
import { useAuth } from '../context/AuthContext';
import { useSalesSync } from '../context/SalesSyncContext';
import { formatNumber, formatCurrency } from '../lib/formatters';
import { getTodayStringBolivia, getCurrentMonthStringBolivia } from '../lib/timezone';
import type { SalesFiltersState } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { stats, loading: statsLoading } = useStats();
  const todayStr = useMemo(() => getTodayStringBolivia(), []);
  const todayFilter = useMemo<SalesFiltersState>(() => ({ day: todayStr }), [todayStr]);
  const { sales: recentSales, loading: salesLoading } = useSales(todayFilter, 10);
  const { openDetailModal } = useSalesSync();

  const {
    loading: commissionsLoading,
    commissionsData,
    mySummary,
  } = useDailyCommissions(todayStr);

  const monthStr = getCurrentMonthStringBolivia();

  // Formatear mes para mostrar
  const monthDate = new Date(`${monthStr}-01T12:00:00`);
  const monthLabel = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(monthDate);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Resumen</h2>
        <p className="text-xs text-slate-400 mt-0.5 capitalize">
          Hoy: {new Intl.DateTimeFormat('es-BO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${todayStr}T12:00:00`))}
        </p>
      </div>

      {/* Stats del día */}
      <section>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Hoy</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            title="Ventas hoy"
            value={formatNumber(stats.today_sales_count)}
            subtitle="Operaciones de hoy"
            icon={ShoppingBag}
            accentColor="blue"
            loading={statsLoading}
          />
          <StatCard
            title="Unidades hoy"
            value={formatNumber(stats.today_units_sold)}
            subtitle="Artículos vendidos"
            icon={Package}
            accentColor="emerald"
            loading={statsLoading}
          />
          <StatCard
            title="Ingreso hoy"
            value={formatCurrency(stats.today_total_amount)}
            subtitle="Facturación del día"
            icon={TrendingUp}
            accentColor="amber"
            loading={statsLoading}
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {/* Tarjeta de Comisiones del Día (Calculada para Administrador y Empleado) */}
        <div className="pt-2">
          <CommissionsSummaryCard
            loading={commissionsLoading}
            commissionsData={commissionsData}
            mySummary={mySummary}
            isAdmin={isAdmin}
            currentUserId={user?.id}
            onSaleClick={openDetailModal}
          />
        </div>
      </section>

      {/* Stats del mes */}
      <section>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 capitalize">
          {monthLabel}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            title="Ventas del mes"
            value={formatNumber(stats.month_sales_count)}
            subtitle="Operaciones del mes"
            icon={CalendarDays}
            accentColor="violet"
            loading={statsLoading}
          />
          <StatCard
            title="Unidades mes"
            value={formatNumber(stats.month_units_sold)}
            subtitle="Total de artículos"
            icon={Package}
            accentColor="blue"
            loading={statsLoading}
          />
          <StatCard
            title="Ingreso mes"
            value={formatCurrency(stats.month_total_amount)}
            subtitle="Acumulado mensual"
            icon={TrendingUp}
            accentColor="emerald"
            loading={statsLoading}
            className="col-span-2 sm:col-span-1"
          />
        </div>
      </section>

      {/* Stats generales */}
      <section>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Total acumulado</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard
            title="Total operaciones"
            value={formatNumber(stats.overall_sales_count)}
            subtitle="Ventas registradas"
            icon={BarChart3}
            accentColor="amber"
            loading={statsLoading}
          />
          <StatCard
            title="Ingreso histórico"
            value={formatCurrency(stats.overall_total_amount)}
            subtitle="Total recaudado"
            icon={TrendingUp}
            accentColor="emerald"
            loading={statsLoading}
          />
        </div>
      </section>

      {/* Ventas recientes de hoy */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ventas recientes
            </h3>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Hoy
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Presiona una para ver el detalle</span>
        </div>
        <RecentSalesList
          sales={recentSales}
          loading={salesLoading}
          onSaleClick={openDetailModal}
        />
      </section>
    </div>
  );
};

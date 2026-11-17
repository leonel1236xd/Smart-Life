import { useState, useEffect, useCallback, useId } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useSalesSync } from '../context/SalesSyncContext';
import {
  getDateRangeForDay,
  getDateRangeForMonth,
  getTodayStringBolivia,
  getCurrentMonthStringBolivia,
} from '../lib/timezone';
import type { SalesStats } from '../types';

export function useStats() {
  const { user } = useAuth();
  const { syncVersion } = useSalesSync();
  const instanceId = useId();
  const [stats, setStats] = useState<SalesStats>({
    today_sales_count: 0,
    today_units_sold: 0,
    today_total_amount: 0,
    month_sales_count: 0,
    month_units_sold: 0,
    month_total_amount: 0,
    overall_sales_count: 0,
    overall_units_sold: 0,
    overall_total_amount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const today = getTodayStringBolivia();
      const currentMonth = getCurrentMonthStringBolivia();

      const todayRange = getDateRangeForDay(today);
      const monthRange = getDateRangeForMonth(currentMonth);

      const { data, error: queryErr } = await supabase
        .from('sales')
        .select('quantity, total_amount, created_at');

      if (queryErr) {
        throw queryErr;
      }

      const sales = data || [];

      let todayCount = 0;
      let todayUnits = 0;
      let todayAmount = 0;

      let monthCount = 0;
      let monthUnits = 0;
      let monthAmount = 0;

      const overallCount = sales.length;
      let overallUnits = 0;
      let overallAmount = 0;

      const todayStart = new Date(todayRange.startIso).getTime();
      const todayEnd = new Date(todayRange.endIso).getTime();
      const monthStart = new Date(monthRange.startIso).getTime();
      const monthEnd = new Date(monthRange.endIso).getTime();

      for (const s of sales) {
        const time = new Date(s.created_at).getTime();
        const qty = Number(s.quantity) || 0;
        const amt = Number(s.total_amount) || 0;

        overallUnits += qty;
        overallAmount += amt;

        if (time >= monthStart && time <= monthEnd) {
          monthCount += 1;
          monthUnits += qty;
          monthAmount += amt;
        }

        if (time >= todayStart && time <= todayEnd) {
          todayCount += 1;
          todayUnits += qty;
          todayAmount += amt;
        }
      }

      setStats({
        today_sales_count: todayCount,
        today_units_sold: todayUnits,
        today_total_amount: todayAmount,
        month_sales_count: monthCount,
        month_units_sold: monthUnits,
        month_total_amount: monthAmount,
        overall_sales_count: overallCount,
        overall_units_sold: overallUnits,
        overall_total_amount: overallAmount,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al calcular estadísticas';
      setError(message);
      console.error('[useStats] error:', message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Actualizar cuando cambia el usuario o cuando syncVersion cambia
  useEffect(() => {
    fetchStats();
  }, [fetchStats, syncVersion]);

  // Suscripción Realtime con canal único
  useEffect(() => {
    if (!isSupabaseConfigured() || !user) return;

    const channelName = `stats_${instanceId.replace(/:/g, '_')}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats, instanceId, user]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats,
  };
}

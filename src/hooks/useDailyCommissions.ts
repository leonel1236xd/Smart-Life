import { useState, useEffect, useCallback, useId, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useSalesSync } from '../context/SalesSyncContext';
import { getDateRangeForDay, getTodayStringBolivia } from '../lib/timezone';
import { calculateDailyCommissions } from '../lib/commissions';
import type { Sale, DailyCommissionsResult, EmployeeCommissionSummary } from '../types';

export function useDailyCommissions(targetDay?: string) {
  const { user } = useAuth();
  const { syncVersion } = useSalesSync();
  const instanceId = useId();

  const dayStr = useMemo(() => targetDay || getTodayStringBolivia(), [targetDay]);

  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDaySales = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) {
      setLoading(false);
      setSales([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { startIso, endIso } = getDateRangeForDay(dayStr);

      // Intentar primero traer columnas category y commission_amount
      let query = supabase
        .from('sales')
        .select(`
          id,
          product_name,
          category,
          commission_amount,
          quantity,
          unit_price,
          total_amount,
          notes,
          employee_id,
          created_at,
          updated_at,
          profiles (
            id,
            full_name,
            email,
            role
          )
        `)
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .order('created_at', { ascending: false });

      let rawData: unknown[] = [];
      const primaryRes = await query;
      let queryErr = primaryRes.error;

      // Fallback si las columnas category/commission_amount aún no fueron agregadas a la BD
      if (!queryErr) {
        rawData = (primaryRes.data || []) as unknown[];
      } else if (queryErr.code === '42703') {
        const fallbackQuery = supabase
          .from('sales')
          .select(`
            id,
            product_name,
            quantity,
            unit_price,
            total_amount,
            notes,
            employee_id,
            created_at,
            updated_at,
            profiles (
              id,
              full_name,
              email,
              role
            )
          `)
          .gte('created_at', startIso)
          .lte('created_at', endIso)
          .order('created_at', { ascending: false });

        const fallbackResult = await fallbackQuery;
        rawData = (fallbackResult.data || []) as unknown[];
        queryErr = fallbackResult.error;
      }

      if (queryErr) {
        throw queryErr;
      }

      const formattedSales: Sale[] = rawData.map((rawItem) => {
        const item = rawItem as any;
        const profileObj = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
        return {
          ...item,
          profiles: profileObj,
        } as Sale;
      });

      setSales(formattedSales);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar comisiones';
      setError(msg);
      console.error('[useDailyCommissions] error:', msg);
    } finally {
      setLoading(false);
    }
  }, [dayStr, user, syncVersion]);

  // Cargar ventas al montar o al cambiar de día/syncVersion
  useEffect(() => {
    fetchDaySales();
  }, [fetchDaySales]);

  // Suscripción Realtime para actualizar comisiones en vivo al registrar ventas
  useEffect(() => {
    if (!isSupabaseConfigured() || !user) return;

    const channelName = `commissions_${dayStr}_${instanceId.replace(/:/g, '_')}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        () => {
          fetchDaySales();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDaySales, dayStr, instanceId, user]);

  // Calcular resultado estructurado de comisiones
  const commissionsData: DailyCommissionsResult = useMemo(() => {
    return calculateDailyCommissions(sales, dayStr);
  }, [sales, dayStr]);

  // Resumen del empleado actualmente logueado
  const mySummary: EmployeeCommissionSummary | null = useMemo(() => {
    if (!user) return null;
    return commissionsData.by_employee[user.id] || null;
  }, [commissionsData, user]);

  return {
    loading,
    error,
    sales,
    commissionsData,
    mySummary,
    refetch: fetchDaySales,
  };
}

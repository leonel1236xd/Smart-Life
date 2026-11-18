import { useState, useEffect, useCallback, useId } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useSalesSync } from '../context/SalesSyncContext';
import { getDateRangeForDay, getDateRangeForMonth } from '../lib/timezone';
import type { Sale, CreateSaleInput, UpdateSaleInput, SalesFiltersState } from '../types';

export function useSales(initialFilters: SalesFiltersState = {}, pageSize = 15) {
  const { user } = useAuth();
  const { syncVersion, triggerRefresh } = useSalesSync();
  const instanceId = useId();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SalesFiltersState>(initialFilters);
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchSales = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) {
      setLoading(false);
      setSales([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
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
        `, { count: 'exact' });

      // Aplicar filtro por día
      if (filters.day) {
        const { startIso, endIso } = getDateRangeForDay(filters.day);
        query = query.gte('created_at', startIso).lte('created_at', endIso);
      }
      // Aplicar filtro por mes (si no hay filtro por día)
      else if (filters.month) {
        const { startIso, endIso } = getDateRangeForMonth(filters.month);
        query = query.gte('created_at', startIso).lte('created_at', endIso);
      }

      // Aplicar filtro por empleado
      if (filters.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }

      // Aplicar búsqueda por nombre de producto
      if (filters.product_search && filters.product_search.trim()) {
        const term = filters.product_search.trim();
        query = query.ilike('product_name', `%${term}%`);
      }

      // Orden cronológico: ventas más recientes primero
      query = query.order('created_at', { ascending: false });

      // Paginación
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error: fetchErr } = await query;

      if (fetchErr) {
        throw fetchErr;
      }

      // Normalizar estructura de profiles si viene como arreglo
      const formattedSales: Sale[] = (data || []).map((item) => {
        const profileObj = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
        return {
          ...item,
          profiles: profileObj,
        } as Sale;
      });

      setSales(formattedSales);
      setTotalCount(count || 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al obtener ventas';
      setError(message);
      console.error('[useSales] fetchSales error:', message);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize, user, syncVersion]);

  // Ejecutar búsqueda cuando cambian filtros, página, usuario o syncVersion
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Suscripción Realtime con nombre de canal único por instancia
  useEffect(() => {
    if (!isSupabaseConfigured() || !user) return;

    const channelName = `sales_list_${instanceId.replace(/:/g, '_')}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        () => {
          fetchSales();
          triggerRefresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSales, instanceId, user, triggerRefresh]);

  const updateFilters = (newFilters: Partial<SalesFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const createSale = async (input: CreateSaleInput): Promise<{ data: Sale | null; error: Error | null }> => {
    if (!user) {
      return { data: null, error: new Error('Usuario no autenticado') };
    }
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase no está configurado') };
    }

    try {
      setSubmitting(true);

      const cleanedName = input.product_name.trim();
      if (!cleanedName) {
        throw new Error('El nombre del producto es obligatorio');
      }

      const qty = Math.floor(Number(input.quantity));
      if (isNaN(qty) || qty <= 0) {
        throw new Error('La cantidad debe ser un número entero positivo');
      }

      const price = Number(input.unit_price);
      if (input.unit_price === null || input.unit_price === undefined || isNaN(price) || price <= 0) {
        throw new Error('El precio unitario es obligatorio y debe ser mayor a 0');
      }

      const calculatedTotal = Math.round(qty * price * 100) / 100;

      const { data, error: insertErr } = await supabase
        .from('sales')
        .insert({
          product_name: cleanedName,
          quantity: qty,
          unit_price: price,
          total_amount: calculatedTotal,
          notes: input.notes?.trim() || null,
          employee_id: user.id,
        })
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
        .single();

      if (insertErr) {
        throw insertErr;
      }

      const profileObj = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
      const createdSale = { ...data, profiles: profileObj } as Sale;

      // Disparar sincronización global instantánea
      triggerRefresh();

      return { data: createdSale, error: null };
    } catch (err: unknown) {
      const errObj = err instanceof Error ? err : new Error('Error al registrar la venta');
      return { data: null, error: errObj };
    } finally {
      setSubmitting(false);
    }
  };

  const updateSale = async (
    saleId: string,
    input: UpdateSaleInput
  ): Promise<{ data: Sale | null; error: Error | null }> => {
    if (!isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase no está configurado') };
    }

    try {
      setSubmitting(true);

      const cleanedName = input.product_name.trim();
      if (!cleanedName) {
        throw new Error('El nombre del producto es obligatorio');
      }

      const qty = Math.floor(Number(input.quantity));
      if (isNaN(qty) || qty <= 0) {
        throw new Error('La cantidad debe ser un número entero positivo');
      }

      const price = Number(input.unit_price);
      if (input.unit_price === null || input.unit_price === undefined || isNaN(price) || price <= 0) {
        throw new Error('El precio unitario es obligatorio y debe ser mayor a 0');
      }

      const calculatedTotal = Math.round(qty * price * 100) / 100;

      const { data, error: updateErr } = await supabase
        .from('sales')
        .update({
          product_name: cleanedName,
          quantity: qty,
          unit_price: price,
          total_amount: calculatedTotal,
          notes: input.notes?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', saleId)
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
        .single();

      if (updateErr) {
        throw updateErr;
      }

      const profileObj = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
      const updatedSale = { ...data, profiles: profileObj } as Sale;

      // Disparar sincronización global instantánea
      triggerRefresh();

      return { data: updatedSale, error: null };
    } catch (err: unknown) {
      const errObj = err instanceof Error ? err : new Error('Error al actualizar la venta');
      return { data: null, error: errObj };
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSale = async (saleId: string): Promise<{ error: Error | null }> => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase no está configurado') };
    }

    try {
      const { error: delErr } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (delErr) {
        throw delErr;
      }

      // Disparar sincronización global instantánea
      triggerRefresh();
      return { error: null };
    } catch (err: unknown) {
      const errObj = err instanceof Error ? err : new Error('Error al eliminar la venta');
      return { error: errObj };
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    sales,
    loading,
    submitting,
    error,
    filters,
    page,
    totalPages,
    totalCount,
    setPage,
    updateFilters,
    clearFilters,
    refreshSales: fetchSales,
    createSale,
    updateSale,
    deleteSale,
  };
}

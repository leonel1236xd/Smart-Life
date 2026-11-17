import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../types';

export function useEmployees(includeInactive = true) {
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (!includeInactive) {
        query = query.eq('active', true);
      }

      const { data, error: fetchErr } = await query;

      if (fetchErr) {
        throw fetchErr;
      }

      setEmployees((data as Profile[]) || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar empleados';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    error,
    refreshEmployees: fetchEmployees,
  };
}

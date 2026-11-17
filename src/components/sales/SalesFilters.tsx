import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Search, CalendarDays, UserCircle, SlidersHorizontal } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import type { SalesFiltersState } from '../../types';
import type { Profile } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { getTodayStringBolivia, getCurrentMonthStringBolivia } from '../../lib/timezone';

interface SalesFiltersProps {
  filters: SalesFiltersState;
  onUpdateFilters: (filters: Partial<SalesFiltersState>) => void;
  onClearFilters: () => void;
  employees: Profile[];
  employeesLoading: boolean;
}

export const SalesFilters: React.FC<SalesFiltersProps> = ({
  filters,
  onUpdateFilters,
  onClearFilters,
  employees,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.product_search || '');
  const debouncedSearch = useDebounce(localSearch, 400);

  // Aplicar búsqueda debounced
  React.useEffect(() => {
    if (debouncedSearch !== (filters.product_search || '')) {
      onUpdateFilters({ product_search: debouncedSearch || undefined });
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasActiveFilters = Boolean(filters.day || filters.month || filters.employee_id || filters.product_search);

  const handleClear = () => {
    setLocalSearch('');
    onClearFilters();
  };

  return (
    <div className="space-y-3">
      {/* Barra de búsqueda siempre visible + botón de filtros */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Buscar producto..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            rightElement={
              localSearch ? (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    onUpdateFilters({ product_search: undefined });
                  }}
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : undefined
            }
          />
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-3 rounded-xl border transition-colors active:scale-95 shrink-0 min-h-[44px] ${
            isExpanded || hasActiveFilters
              ? 'bg-blue-950/50 border-blue-500/30 text-blue-400'
              : 'bg-[#0c111a] border-[#222d3d] text-slate-400 hover:text-white hover:border-[#2b3a52]'
          }`}
          aria-label="Filtros avanzados"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Panel de filtros expandible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-[#0f141f] border border-[#1b2535] space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Filter className="w-3.5 h-3.5" />
                Filtros avanzados
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Filtro por día */}
                <Input
                  label="Filtrar por día"
                  type="date"
                  value={filters.day || ''}
                  max={getTodayStringBolivia()}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateFilters({
                      day: val || undefined,
                      month: val ? undefined : filters.month,
                    });
                  }}
                  leftIcon={<CalendarDays className="w-4 h-4" />}
                />

                {/* Filtro por mes */}
                <Input
                  label="Filtrar por mes"
                  type="month"
                  value={filters.day ? '' : filters.month || ''}
                  max={getCurrentMonthStringBolivia()}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateFilters({
                      month: val || undefined,
                      day: val ? undefined : filters.day,
                    });
                  }}
                  leftIcon={<CalendarDays className="w-4 h-4" />}
                  disabled={Boolean(filters.day)}
                />

                {/* Filtro por empleado */}
                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 tracking-wide">Empleado</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <UserCircle className="w-4 h-4" />
                    </div>
                    <select
                      value={filters.employee_id || ''}
                      onChange={(e) => onUpdateFilters({ employee_id: e.target.value || undefined })}
                      className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0c111a] border border-[#222d3d] text-slate-100 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0084FF]/40 focus:border-[#0084FF] appearance-none cursor-pointer"
                    >
                      <option value="">Todos los empleados</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Acciones de filtro */}
              {hasActiveFilters && (
                <div className="pt-1">
                  <Button variant="ghost" size="sm" icon={<X className="w-3.5 h-3.5" />} onClick={handleClear}>
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de filtros activos cuando el panel está cerrado */}
      {!isExpanded && hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs text-blue-400">
          <Filter className="w-3 h-3" />
          <span>Filtros activos</span>
          <button
            type="button"
            onClick={handleClear}
            className="underline hover:text-blue-300 transition-colors"
          >
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
};

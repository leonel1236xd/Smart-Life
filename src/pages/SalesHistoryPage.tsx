import React, { useState, useCallback } from 'react';
import { ClipboardList, AlertTriangle, FileDown } from 'lucide-react';
import { useSales } from '../hooks/useSales';
import { useEmployees } from '../hooks/useEmployees';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSalesSync } from '../context/SalesSyncContext';
import { SalesFilters } from '../components/sales/SalesFilters';
import { SalesTable } from '../components/sales/SalesTable';
import { SaleCard } from '../components/sales/SaleCard';
import { Pagination } from '../components/common/Pagination';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { SalesReportModal } from '../components/sales/SalesReportModal';
import { Button } from '../components/common/Button';
import { useMediaQuery } from '../hooks/useMediaQuery';

export const SalesHistoryPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const { openDetailModal, openEditModal } = useSalesSync();
  const { employees, loading: employeesLoading } = useEmployees(false);
  const {
    sales,
    loading,
    filters,
    page,
    totalPages,
    totalCount,
    setPage,
    updateFilters,
    clearFilters,
    deleteSale,
  } = useSales({}, 15);

  const isMobile = useMediaQuery('(max-width: 767px)');
  const [saleToDeleteId, setSaleToDeleteId] = useState<string | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleDeleteRequest = (saleId: string) => {
    setSaleToDeleteId(saleId);
  };

  const handleConfirmDelete = useCallback(async () => {
    if (!saleToDeleteId) return;

    try {
      setDeletingLoading(true);
      const result = await deleteSale(saleToDeleteId);

      if (result.error) {
        toast.error('Error al eliminar', result.error.message);
      } else {
        toast.success('Venta eliminada correctamente');
        setSaleToDeleteId(null);
      }
    } finally {
      setDeletingLoading(false);
    }
  }, [deleteSale, saleToDeleteId, toast]);

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-400" />
            Historial de Ventas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Presiona cualquier venta para ver toda la información detallada en pantalla
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {!loading && (
            <span className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[#111722] border border-[#1c2738] text-slate-300">
              {totalCount} registro{totalCount !== 1 ? 's' : ''} en total
            </span>
          )}

          {isAdmin && (
            <Button
              variant="secondary"
              size="sm"
              icon={<FileDown className="w-4 h-4 text-rose-400" />}
              onClick={() => setIsReportModalOpen(true)}
              className="border-rose-500/30 text-rose-200 hover:bg-rose-950/40 hover:border-rose-500/50"
            >
              Exportar PDF
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <SalesFilters
        filters={filters}
        onUpdateFilters={updateFilters}
        onClearFilters={clearFilters}
        employees={employees}
        employeesLoading={employeesLoading}
      />

      {/* Lista de ventas */}
      {isMobile ? (
        // Vista móvil: tarjetas interactivas
        <div className="space-y-2.5">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-[#111722] border border-[#1c2738] animate-pulse"
              />
            ))
          ) : sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-[#0f141f] border border-[#1b2535]">
              <ClipboardList className="w-10 h-10 text-blue-400/50 mb-3" />
              <p className="text-sm font-semibold text-white">Sin ventas</p>
              <p className="text-xs text-slate-400 mt-1">
                No se encontraron registros con los filtros actuales.
              </p>
            </div>
          ) : (
            sales.map((sale, index) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                index={index}
                showDelete={isAdmin}
                onDelete={handleDeleteRequest}
                showEdit={isAdmin}
                onEdit={openEditModal}
                onClick={openDetailModal}
              />
            ))
          )}
        </div>
      ) : (
        // Vista escritorio: tabla interactiva
        <SalesTable
          sales={sales}
          loading={loading}
          showDelete={isAdmin}
          onDelete={handleDeleteRequest}
          showEdit={isAdmin}
          onEdit={openEditModal}
          onClick={openDetailModal}
        />
      )}

      {/* Paginación */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={setPage}
      />

      {/* Modal estilizado de confirmación de eliminación (reemplaza window.confirm) */}
      <ConfirmModal
        isOpen={Boolean(saleToDeleteId)}
        title="¿Eliminar esta venta?"
        description="Esta acción eliminará el registro de la venta de forma permanente y actualizará los totales y estadísticas del sistema."
        variant="danger"
        icon={<AlertTriangle className="w-6 h-6 text-rose-400" />}
        confirmText="Eliminar Venta"
        cancelText="Conservar"
        loading={deletingLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSaleToDeleteId(null)}
      />

      {/* Modal para generar y descargar Reporte de Ventas en PDF (Solo Administrador) */}
      {isAdmin && (
        <SalesReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  );
};

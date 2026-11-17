import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  UserX,
  UserCheck,
  Mail,
  Search,
  CheckCircle2,
  Ban,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useEmployees } from '../hooks/useEmployees';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { createEmployee, type CreateEmployeeInput } from '../lib/admin';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Input } from '../components/common/Input';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmployeeFormModal } from '../components/employees/EmployeeFormModal';
import { EmployeeSuccessModal } from '../components/employees/EmployeeSuccessModal';
import { formatDateBolivia } from '../lib/timezone';
import type { Profile } from '../types';

type FilterTab = 'all' | 'active' | 'inactive';

interface ToggleActiveModalState {
  isOpen: boolean;
  emp: Profile | null;
  targetActive: boolean;
}

export const EmployeesPage: React.FC = () => {
  const { profile: currentProfile } = useAuth();
  const { toast } = useToast();
  const { employees, loading, refreshEmployees } = useEmployees(true);

  // Estados de modales
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<CreateEmployeeInput | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal de confirmación para Habilitar / Inhabilitar
  const [activeConfirmModal, setActiveConfirmModal] = useState<ToggleActiveModalState>({
    isOpen: false,
    emp: null,
    targetActive: false,
  });
  const [updatingAction, setUpdatingAction] = useState(false);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Crear empleado con modal de éxito atractivo (sin alerts)
  const handleCreateEmployee = useCallback(
    async (input: CreateEmployeeInput): Promise<{ error: Error | null }> => {
      setSubmitting(true);
      const result = await createEmployee(input);

      if (result.error) {
        toast.error('Error al crear empleado', result.error.message);
      } else {
        setCreatedEmployee(input);
        setShowSuccessModal(true);
        setTimeout(() => refreshEmployees(), 1500);
      }

      setSubmitting(false);
      return result;
    },
    [toast, refreshEmployees]
  );

  // Cambiar rol de empleado
  const handleToggleRole = useCallback(
    async (emp: Profile) => {
      if (emp.id === currentProfile?.id) {
        toast.error('Acción no permitida', 'No puedes cambiar tu propio rol');
        return;
      }

      setUpdatingId(emp.id);
      const newRole = emp.role === 'admin' ? 'employee' : 'admin';

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', emp.id);

      if (error) {
        toast.error('Error', error.message);
      } else {
        toast.success(
          'Rol actualizado',
          `${emp.full_name} ahora es ${newRole === 'admin' ? 'administrador' : 'empleado'}`
        );
        await refreshEmployees();
      }

      setUpdatingId(null);
    },
    [currentProfile, toast, refreshEmployees]
  );

  // Abrir modal de confirmación en vez de alert
  const promptToggleActive = (emp: Profile) => {
    if (emp.id === currentProfile?.id) {
      toast.error('Acción no permitida', 'No puedes inhabilitar tu propia cuenta');
      return;
    }
    setActiveConfirmModal({
      isOpen: true,
      emp,
      targetActive: !emp.active,
    });
  };

  // Ejecutar cambio tras confirmación en el modal
  const handleConfirmToggleActive = async () => {
    const { emp, targetActive } = activeConfirmModal;
    if (!emp) return;

    try {
      setUpdatingAction(true);

      const { error } = await supabase
        .from('profiles')
        .update({ active: targetActive })
        .eq('id', emp.id);

      if (error) {
        toast.error('Error al actualizar', error.message);
      } else {
        toast.success(
          targetActive ? 'Cuenta habilitada' : 'Cuenta inhabilitada',
          targetActive
            ? `${emp.full_name} puede volver a ingresar al sistema.`
            : `${emp.full_name} permanece en el registro con acceso bloqueado.`
        );
        await refreshEmployees();
        setActiveConfirmModal({ isOpen: false, emp: null, targetActive: false });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al modificar estado';
      toast.error('Error', msg);
    } finally {
      setUpdatingAction(false);
    }
  };

  // Estadísticas de estados
  const activeCount = useMemo(() => employees.filter((e) => e.active).length, [employees]);
  const inactiveCount = useMemo(() => employees.filter((e) => !e.active).length, [employees]);

  // Filtrado por tab y búsqueda
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (activeTab === 'active' && !emp.active) return false;
      if (activeTab === 'inactive' && emp.active) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = emp.full_name.toLowerCase().includes(query);
        const matchEmail = emp.email.toLowerCase().includes(query);
        return matchName || matchEmail;
      }

      return true;
    });
  }, [employees, activeTab, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Gestión de Empleados
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Administra los usuarios del sistema, sus roles y estados de acceso
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
        >
          Nuevo empleado
        </Button>
      </div>

      {/* Barra de pestañas y búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Pestañas de estado con scroll horizontal suave en móvil */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0f141f] border border-[#1b2535] overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-[#1a2333] text-white border border-[#2b3a52]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({employees.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Habilitados ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'inactive'
                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <Ban className="w-3 h-3 text-amber-400" />
            Inhabilitados ({inactiveCount})
          </button>
        </div>

        {/* Buscador */}
        <div className="w-full sm:w-64">
          <Input
            placeholder="Buscar por nombre o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Lista de empleados */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3.5 p-4 rounded-xl bg-[#111722] border border-[#1c2738]">
              <Skeleton className="w-11 h-11 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'inactive'
              ? 'No hay empleados inhabilitados'
              : activeTab === 'active'
              ? 'No hay empleados habilitados'
              : 'No se encontraron empleados'
          }
          description={
            searchQuery
              ? 'No coincide ningún empleado con el término de búsqueda.'
              : 'Todos los empleados registrados aparecerán en esta lista.'
          }
          icon={<Users className="w-7 h-7" />}
          actionText={activeTab === 'all' && !searchQuery ? 'Crear empleado' : undefined}
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredEmployees.map((emp, index) => {
            const isCurrentUser = emp.id === currentProfile?.id;
            const isUpdating = updatingId === emp.id;

            return (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={`p-4 rounded-xl border transition-all ${
                  !emp.active
                    ? 'bg-[#0e121a] border-[#221c1a] shadow-inner'
                    : 'bg-[#111722] border-[#1c2738] hover:border-[#28384f]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Avatar + Datos del Empleado */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-base font-bold transition-colors ${
                        !emp.active
                          ? 'bg-slate-900 border border-slate-800 text-slate-500'
                          : emp.role === 'admin'
                          ? 'bg-blue-950/70 border border-blue-500/40 text-blue-400'
                          : 'bg-[#182130] border border-[#24334a] text-slate-300'
                      }`}
                    >
                      {emp.full_name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={`text-sm font-semibold truncate ${
                            emp.active ? 'text-white' : 'text-slate-400 line-through'
                          }`}
                        >
                          {emp.full_name}
                        </p>
                        {isCurrentUser && (
                          <Badge variant="outline" size="sm">Tú</Badge>
                        )}
                        <Badge
                          variant={emp.role === 'admin' ? 'primary' : 'default'}
                          size="sm"
                          icon={
                            emp.role === 'admin' ? (
                              <ShieldCheck className="w-3 h-3" />
                            ) : (
                              <Shield className="w-3 h-3" />
                            )
                          }
                        >
                          {emp.role === 'admin' ? 'Administrador' : 'Empleado'}
                        </Badge>

                        {/* Badge de Estado: Habilitado vs Inhabilitado */}
                        {emp.active ? (
                          <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                            Habilitado
                          </Badge>
                        ) : (
                          <Badge variant="danger" size="sm" icon={<Ban className="w-3 h-3" />}>
                            Inhabilitado
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          {emp.email}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3 shrink-0" />
                          Registrado: {formatDateBolivia(emp.created_at)}
                        </span>
                      </div>

                      {!emp.active && (
                        <p className="text-[11px] text-amber-400/90 mt-1 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          Acceso bloqueado: este usuario no puede iniciar sesión.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción directos */}
                  {!isCurrentUser && (
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1a2333] w-full sm:w-auto justify-end">
                      {/* Cambiar rol */}
                      <button
                        type="button"
                        onClick={() => handleToggleRole(emp)}
                        disabled={isUpdating}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#161f2c] border border-[#24334a] text-slate-300 hover:text-white hover:bg-[#1e2a3c] transition-colors active:scale-95 disabled:opacity-50"
                        title={emp.role === 'admin' ? 'Cambiar a Empleado regular' : 'Hacer Administrador'}
                      >
                        {emp.role === 'admin' ? 'Hacer Empleado' : 'Hacer Admin'}
                      </button>

                      {/* Botón de Habilitar / Inhabilitar abre el modal estilizado */}
                      {emp.active ? (
                        <button
                          type="button"
                          onClick={() => promptToggleActive(emp)}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 hover:text-rose-100 transition-colors active:scale-95 disabled:opacity-50"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Inhabilitar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => promptToggleActive(emp)}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 hover:text-emerald-100 transition-colors active:scale-95 disabled:opacity-50"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Habilitar acceso
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal para formulario de nuevo empleado */}
      <EmployeeFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateEmployee}
        submitting={submitting}
      />

      {/* Modal atractivo de confirmación tras crear empleado */}
      <EmployeeSuccessModal
        isOpen={showSuccessModal}
        employeeData={createdEmployee}
        onClose={() => setShowSuccessModal(false)}
        onCreateAnother={() => {
          setShowSuccessModal(false);
          setCreateModalOpen(true);
        }}
      />

      {/* Modal estilizado para confirmar Inhabilitar o Habilitar acceso (reemplaza window.confirm) */}
      <ConfirmModal
        isOpen={activeConfirmModal.isOpen}
        title={
          activeConfirmModal.targetActive
            ? `¿Habilitar acceso a ${activeConfirmModal.emp?.full_name}?`
            : `¿Inhabilitar acceso a ${activeConfirmModal.emp?.full_name}?`
        }
        description={
          activeConfirmModal.targetActive ? (
            <p>
              El usuario <span className="font-semibold text-white">{activeConfirmModal.emp?.full_name}</span> podrá
              volver a iniciar sesión inmediatamente con sus credenciales habituales.
            </p>
          ) : (
            <p>
              El usuario <span className="font-semibold text-white">{activeConfirmModal.emp?.full_name}</span> no será
              eliminado de la lista ni se perderán sus ventas registradas, pero su acceso quedará bloqueado de
              inmediato. Podrás volver a habilitarlo en cualquier momento.
            </p>
          )
        }
        variant={activeConfirmModal.targetActive ? 'success' : 'danger'}
        icon={
          activeConfirmModal.targetActive ? (
            <UserCheck className="w-7 h-7 text-emerald-400" />
          ) : (
            <UserX className="w-7 h-7 text-rose-400" />
          )
        }
        confirmText={activeConfirmModal.targetActive ? 'Habilitar Acceso' : 'Inhabilitar Acceso'}
        cancelText="Cancelar"
        loading={updatingAction}
        onConfirm={handleConfirmToggleActive}
        onCancel={() =>
          setActiveConfirmModal({ isOpen: false, emp: null, targetActive: false })
        }
      />
    </div>
  );
};

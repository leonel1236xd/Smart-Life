import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Save,
  CheckCircle2,
  Ban,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';
import type { Profile, UserRole } from '../../types';

export interface EmployeeEditFormData {
  full_name: string;
  email: string;
  password?: string;
  role: UserRole;
  active: boolean;
}

interface EmployeeEditModalProps {
  isOpen: boolean;
  employee: Profile | null;
  isCurrentUser: boolean;
  onClose: () => void;
  onSubmit: (
    empId: string,
    data: EmployeeEditFormData
  ) => Promise<{ error: Error | null; rpcMissing?: boolean }>;
  submitting?: boolean;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
}

export const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  isOpen,
  employee,
  isCurrentUser,
  onClose,
  onSubmit,
  submitting = false,
}) => {
  const nameRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('employee');
  const [active, setActive] = useState<boolean>(true);
  const [errors, setErrors] = useState<FormErrors>({});

  // Cargar datos del empleado seleccionado al abrir
  useEffect(() => {
    if (isOpen && employee) {
      setFullName(employee.full_name || '');
      setEmail(employee.email || '');
      setPassword('');
      setShowPassword(false);
      setRole(employee.role || 'employee');
      setActive(Boolean(employee.active));
      setErrors({});

      if (window.innerWidth >= 640) {
        setTimeout(() => nameRef.current?.focus(), 150);
      }
    }
  }, [isOpen, employee]);

  if (!employee) return null;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    // 1. Validar nombre
    if (!trimmedName) {
      newErrors.full_name = 'El nombre completo es obligatorio';
    } else if (trimmedName.length < 2) {
      newErrors.full_name = 'Debe tener al menos 2 caracteres';
    }

    // 2. Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    // 3. Validar password (opcional: solo si se ingresa texto)
    if (trimmedPass && trimmedPass.length < 6) {
      newErrors.password = 'La nueva contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    // Protección adicional: el usuario actual no puede removerse rol ni auto-inhabilitarse
    const targetRole: UserRole = isCurrentUser ? employee.role : role;
    const targetActive: boolean = isCurrentUser ? employee.active : active;

    const payload: EmployeeEditFormData = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      role: targetRole,
      active: targetActive,
    };

    if (password.trim().length > 0) {
      payload.password = password.trim();
    }

    const result = await onSubmit(employee.id, payload);

    if (!result.error) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Empleado"
      subtitle={`Modificando información de: ${employee.full_name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Nombre completo */}
        <Input
          ref={nameRef}
          label="Nombre completo"
          placeholder="Ej: Juan Carlos Pérez"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.full_name) setErrors((prev) => ({ ...prev, full_name: undefined }));
          }}
          error={errors.full_name}
          required
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="off"
        />

        {/* Correo electrónico */}
        <Input
          type="email"
          label="Correo electrónico de acceso"
          placeholder="ejemplo@smartlife.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          required
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="off"
        />

        {/* Nueva Contraseña (Opcional) */}
        <div className="w-full flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 tracking-wide flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              Nueva contraseña
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              (Opcional: dejar en blanco para no cambiarla)
            </span>
          </label>

          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-slate-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Escribe una nueva contraseña (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              autoComplete="new-password"
              className={`w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-xl bg-[#0c111a] border text-slate-100 text-sm placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-[#0084FF]/40 focus:border-[#0084FF] ${
                errors.password ? 'border-rose-500/80' : 'border-[#222d3d]'
              }`}
            />

            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-200 transition-colors"
              title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {errors.password ? (
            <p className="text-xs text-rose-400">{errors.password}</p>
          ) : (
            <p className="text-[11px] text-slate-500">
              Solo escribe en este campo si deseas restablecer o cambiar la clave del usuario.
            </p>
          )}
        </div>

        {/* Selector de Rol */}
        <div className="w-full flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 tracking-wide">
            Rol en el sistema <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Shield className="w-4 h-4" />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={isCurrentUser}
              className={`w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0c111a] border border-[#222d3d] text-slate-100 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0084FF]/40 focus:border-[#0084FF] appearance-none ${
                isCurrentUser ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <option value="employee">Empleado (Control de ventas e historial)</option>
              <option value="admin">Administrador (Control total, empleados y reportes)</option>
            </select>
          </div>
          {isCurrentUser ? (
            <p className="text-[11px] text-amber-400/90 flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Por seguridad, no puedes degradar tu propia cuenta de administrador.
            </p>
          ) : (
            <p className="text-[11px] text-slate-500">
              {role === 'admin'
                ? 'El administrador puede gestionar empleados, editar/eliminar ventas y exportar PDF.'
                : 'El empleado solo puede registrar ventas y consultar el historial.'}
            </p>
          )}
        </div>

        {/* Estado de acceso: Habilitado o Inhabilitado */}
        <div className="w-full flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 tracking-wide">
            Estado de acceso a la cuenta
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isCurrentUser}
              onClick={() => setActive(true)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                active
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-950/40'
                  : 'bg-[#0c111a] border-[#222d3d] text-slate-400 hover:text-white'
              } ${isCurrentUser ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Habilitado</span>
            </button>

            <button
              type="button"
              disabled={isCurrentUser}
              onClick={() => setActive(false)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                !active
                  ? 'bg-rose-950/70 border-rose-500/50 text-rose-300 shadow-sm shadow-rose-950/40'
                  : 'bg-[#0c111a] border-[#222d3d] text-slate-400 hover:text-white'
              } ${isCurrentUser ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <Ban className="w-4 h-4 text-rose-400" />
              <span>Inhabilitado</span>
            </button>
          </div>
          {isCurrentUser ? (
            <p className="text-[11px] text-amber-400/90 flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              No puedes inhabilitar tu propia sesión activa.
            </p>
          ) : !active ? (
            <p className="text-[11px] text-rose-400/90 flex items-center gap-1 mt-0.5">
              <Ban className="w-3.5 h-3.5 shrink-0" />
              El usuario tendrá bloqueado el acceso al sistema mientras esté inhabilitado.
            </p>
          ) : (
            <p className="text-[11px] text-emerald-400/90 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              El usuario puede iniciar sesión y operar con normalidad.
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2.5 sm:gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 min-h-[46px]"
            disabled={submitting}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            icon={<Save className="w-4 h-4" />}
            className="flex-1 min-h-[46px]"
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
};

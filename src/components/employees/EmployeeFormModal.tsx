import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { User, Mail, Lock, Shield, Eye, EyeOff, UserPlus } from 'lucide-react';
import type { CreateEmployeeInput } from '../../lib/admin';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateEmployeeInput) => Promise<{ error: Error | null }>;
  submitting: boolean;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  submitting,
}) => {
  const nameRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<CreateEmployeeInput>({
    full_name: '',
    email: '',
    password: '',
    role: 'employee',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameRef.current?.focus(), 200);
    } else {
      setFormData({ full_name: '', email: '', password: '', role: 'employee' });
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre es obligatorio';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Mínimo 2 caracteres';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Correo no válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    const result = await onSubmit(formData);

    if (!result.error) {
      onClose();
    }
  };

  const handleFieldChange = (field: keyof CreateEmployeeInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo empleado" subtitle="Crear cuenta de acceso al sistema">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          ref={nameRef}
          label="Nombre completo"
          placeholder="Ej: Juan Pérez"
          value={formData.full_name}
          onChange={(e) => handleFieldChange('full_name', e.target.value)}
          error={errors.full_name}
          required
          leftIcon={<User className="w-4 h-4" />}
          autoComplete="off"
        />

        <Input
          label="Correo electrónico"
          type="email"
          placeholder="juan@smartlife.com"
          value={formData.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          error={errors.email}
          required
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="off"
        />

        <Input
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="Mínimo 6 caracteres"
          value={formData.password}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          error={errors.password}
          required
          leftIcon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {/* Selector de rol */}
        <div className="w-full flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 tracking-wide">
            Rol <span className="text-rose-400 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Shield className="w-4 h-4" />
            </div>
            <select
              value={formData.role}
              onChange={(e) => handleFieldChange('role', e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0c111a] border border-[#222d3d] text-slate-100 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0084FF]/40 focus:border-[#0084FF] appearance-none cursor-pointer"
            >
              <option value="employee">Empleado</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <p className="text-[11px] text-slate-500">
            {formData.role === 'admin'
              ? 'Puede gestionar empleados y eliminar ventas'
              : 'Puede registrar ventas y consultar el historial'}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={submitting} icon={<UserPlus className="w-4 h-4" />} className="flex-1">
            Crear empleado
          </Button>
        </div>
      </form>
    </Modal>
  );
};

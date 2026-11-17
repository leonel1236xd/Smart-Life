import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Package, Hash, DollarSign, FileText, PlusCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import type { CreateSaleInput, Sale } from '../../types';

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateSaleInput) => Promise<{ data: Sale | null; error: Error | null }>;
  onSuccess?: (sale: Sale) => void;
  submitting: boolean;
}

interface FormErrors {
  product_name?: string;
  quantity?: string;
  unit_price?: string;
}

export const SaleFormModal: React.FC<SaleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  submitting,
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const productRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateSaleInput>({
    product_name: '',
    quantity: 1,
    unit_price: null,
    notes: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Focus en el campo de producto al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        productRef.current?.focus();
      }, 200);
    } else {
      // Resetear formulario al cerrar
      setFormData({ product_name: '', quantity: 1, unit_price: null, notes: null });
      setErrors({});
    }
  }, [isOpen]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedName = formData.product_name.trim();

    if (!trimmedName) {
      newErrors.product_name = 'El nombre del producto es obligatorio';
    } else if (trimmedName.length < 2) {
      newErrors.product_name = 'Debe tener al menos 2 caracteres';
    }

    const qty = Number(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      newErrors.quantity = 'La cantidad debe ser un número entero mayor a 0';
    } else if (!Number.isInteger(qty)) {
      newErrors.quantity = 'Debe ser un número entero';
    }

    // Precio Unitario AHORA ES OBLIGATORIO
    if (
      formData.unit_price === null ||
      formData.unit_price === undefined ||
      formData.unit_price === ('' as unknown)
    ) {
      newErrors.unit_price = 'El precio unitario es obligatorio';
    } else {
      const price = Number(formData.unit_price);
      if (isNaN(price) || price <= 0) {
        newErrors.unit_price = 'Ingresa un precio válido mayor a 0 (ej: 50)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    const result = await onSubmit(formData);

    if (result.error) {
      toast.error('Error al registrar la venta', result.error.message);
    } else if (result.data) {
      onClose();
      if (onSuccess) {
        onSuccess(result.data);
      }
    }
  };

  const handleFieldChange = (field: keyof CreateSaleInput, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo al modificar
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Cálculo de total estimado en vivo
  const quantityNum = Number(formData.quantity) || 0;
  const priceNum = Number(formData.unit_price) || 0;
  const totalEstimado = quantityNum > 0 && priceNum > 0 ? quantityNum * priceNum : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar venta"
      subtitle={profile ? `Registrando como ${profile.full_name}` : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Producto */}
        <Input
          ref={productRef}
          label="Producto o accesorio"
          placeholder="Ej: Laptop HP 15-ef, Mouse Gamer, Cable HDMI..."
          value={formData.product_name}
          onChange={(e) => handleFieldChange('product_name', e.target.value)}
          error={errors.product_name}
          required
          leftIcon={<Package className="w-4 h-4" />}
          autoComplete="off"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Cantidad */}
          <Input
            label="Cantidad"
            type="number"
            placeholder="1"
            min={1}
            step={1}
            value={formData.quantity === 0 ? '' : String(formData.quantity)}
            onChange={(e) => {
              const val = e.target.value;
              handleFieldChange('quantity', val === '' ? 0 : parseInt(val, 10));
            }}
            error={errors.quantity}
            required
            leftIcon={<Hash className="w-4 h-4" />}
            inputMode="numeric"
          />

          {/* Precio unitario (OBLIGATORIO) */}
          <Input
            label="Precio unitario (Bs.)"
            type="number"
            placeholder="50 Bs"
            min={0.01}
            step={0.01}
            value={
              formData.unit_price === null || formData.unit_price === undefined
                ? ''
                : String(formData.unit_price)
            }
            onChange={(e) => {
              const val = e.target.value;
              handleFieldChange('unit_price', val === '' ? null : parseFloat(val));
            }}
            error={errors.unit_price}
            required
            leftIcon={<DollarSign className="w-4 h-4" />}
            inputMode="decimal"
          />
        </div>

        {/* Resumen dinámico del total */}
        {totalEstimado !== null && (
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs">
            <span className="text-slate-300 font-medium">Total de la operación:</span>
            <span className="text-base font-bold text-emerald-400">
              {formatCurrency(totalEstimado)}
            </span>
          </div>
        )}

        {/* Notas (opcional) */}
        <div className="w-full flex flex-col gap-1.5">
          <label htmlFor="sale-notes" className="text-xs font-semibold text-slate-300 tracking-wide">
            Notas u observaciones
          </label>
          <div className="relative flex items-start">
            <div className="absolute left-3.5 top-3 pointer-events-none text-slate-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <textarea
              id="sale-notes"
              rows={2}
              placeholder="Número de serie, color, garantía, etc. (opcional)"
              value={formData.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value || null)}
              className="w-full min-h-[64px] pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0c111a] border border-[#222d3d] text-slate-100 placeholder-slate-500 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0084FF]/40 focus:border-[#0084FF] resize-none"
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            icon={<PlusCircle className="w-4 h-4" />}
            className="flex-1"
          >
            Registrar Venta
          </Button>
        </div>
      </form>
    </Modal>
  );
};

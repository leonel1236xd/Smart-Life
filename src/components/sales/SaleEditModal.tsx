import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  Hash,
  DollarSign,
  FileText,
  Minus,
  Plus,
  Save,
  User,
  Calendar,
  Clock,
} from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import { formatDateBolivia, formatTimeBolivia } from '../../lib/timezone';
import type { Sale, UpdateSaleInput } from '../../types';

interface SaleEditModalProps {
  isOpen: boolean;
  sale: Sale | null;
  onClose: () => void;
  onSubmit: (saleId: string, input: UpdateSaleInput) => Promise<{ data: Sale | null; error: Error | null }>;
  onSuccess?: (sale: Sale) => void;
  submitting?: boolean;
}

interface FormErrors {
  product_name?: string;
  quantity?: string;
  unit_price?: string;
}

export const SaleEditModal: React.FC<SaleEditModalProps> = ({
  isOpen,
  sale,
  onClose,
  onSubmit,
  onSuccess,
  submitting = false,
}) => {
  const { toast } = useToast();
  const productRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UpdateSaleInput>({
    product_name: '',
    quantity: 1,
    unit_price: null,
    notes: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Cargar datos de la venta seleccionada al abrir
  useEffect(() => {
    if (isOpen && sale) {
      setFormData({
        product_name: sale.product_name || '',
        quantity: sale.quantity || 1,
        unit_price: sale.unit_price ?? null,
        notes: sale.notes || '',
      });
      setErrors({});

      if (window.innerWidth >= 640) {
        setTimeout(() => {
          productRef.current?.focus();
        }, 150);
      }
    }
  }, [isOpen, sale]);

  if (!sale) return null;

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
      newErrors.quantity = 'Cantidad mayor a 0';
    } else if (!Number.isInteger(qty)) {
      newErrors.quantity = 'Número entero';
    }

    if (
      formData.unit_price === null ||
      formData.unit_price === undefined ||
      formData.unit_price === ('' as unknown)
    ) {
      newErrors.unit_price = 'El precio es obligatorio';
    } else {
      const price = Number(formData.unit_price);
      if (isNaN(price) || price <= 0) {
        newErrors.unit_price = 'Precio válido mayor a 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    const result = await onSubmit(sale.id, formData);

    if (result.error) {
      toast.error('Error al modificar la venta', result.error.message);
    } else if (result.data) {
      toast.success('Venta modificada correctamente');
      onClose();
      if (onSuccess) {
        onSuccess(result.data);
      }
    }
  };

  const handleFieldChange = (field: keyof UpdateSaleInput, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const adjustQuantity = (delta: number) => {
    const current = Number(formData.quantity) || 1;
    const next = Math.max(1, current + delta);
    handleFieldChange('quantity', next);
  };

  // Cálculo de total dinámico
  const quantityNum = Number(formData.quantity) || 0;
  const priceNum = Number(formData.unit_price) || 0;
  const totalEstimado = quantityNum > 0 && priceNum > 0 ? quantityNum * priceNum : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modificar Venta"
      subtitle={`Venta #${sale.id.slice(0, 8).toUpperCase()}`}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4" noValidate>
        {/* Ficha de trazabilidad original */}
        <div className="p-3 rounded-xl bg-[#0a0e16] border border-[#1a2332] text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">
              Vendido por: <strong className="text-slate-200">{sale.profiles?.full_name || 'Empleado'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              {formatDateBolivia(sale.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {formatTimeBolivia(sale.created_at)}
            </span>
          </div>
        </div>

        {/* Producto */}
        <Input
          ref={productRef}
          label="Producto o accesorio"
          placeholder="Ej: Laptop HP 15, Mouse Gamer, Cable HDMI..."
          value={formData.product_name}
          onChange={(e) => handleFieldChange('product_name', e.target.value)}
          error={errors.product_name}
          required
          leftIcon={<Package className="w-4 h-4" />}
          autoComplete="off"
        />

        {/* Fila Cantidad y Precio en 2 columnas */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          {/* Cantidad con stepper */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 tracking-wide flex items-center justify-between">
              <span>Cantidad <span className="text-rose-400">*</span></span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-2.5 pointer-events-none text-slate-400 shrink-0">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={formData.quantity === 0 ? '' : String(formData.quantity)}
                onChange={(e) => {
                  const val = e.target.value;
                  handleFieldChange('quantity', val === '' ? 0 : parseInt(val, 10));
                }}
                className={`w-full min-h-[44px] pl-8 pr-16 py-2 rounded-xl bg-[#0c111a] border text-slate-100 placeholder-slate-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0084FF]/40 focus:border-[#0084FF] ${
                  errors.quantity ? 'border-rose-500/70' : 'border-[#222d3d]'
                }`}
              />
              <div className="absolute right-1 flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => adjustQuantity(-1)}
                  className="w-7 h-7 rounded-lg bg-[#141b26] hover:bg-[#1a2332] active:scale-90 border border-[#222d3d] flex items-center justify-center text-slate-300 transition-transform"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => adjustQuantity(1)}
                  className="w-7 h-7 rounded-lg bg-[#141b26] hover:bg-[#1a2332] active:scale-90 border border-[#222d3d] flex items-center justify-center text-slate-300 transition-transform"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            {errors.quantity && (
              <p className="text-[11px] text-rose-400 font-medium">{errors.quantity}</p>
            )}
          </div>

          {/* Precio unitario */}
          <Input
            label="Precio Unit. (Bs.)"
            type="number"
            placeholder="Ej: 50 Bs"
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
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Nuevo total:</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {formData.quantity} {Number(formData.quantity) === 1 ? 'unidad' : 'unidades'} × {formatCurrency(formData.unit_price || 0)}
              </p>
            </div>
            <span className="text-base sm:text-lg font-bold text-emerald-400">
              {formatCurrency(totalEstimado)}
            </span>
          </div>
        )}

        {/* Notas u observaciones */}
        <div className="w-full flex flex-col gap-1.5">
          <label htmlFor="edit-sale-notes" className="text-xs font-semibold text-slate-300 tracking-wide">
            Notas u observaciones <span className="text-[11px] font-normal text-slate-500">(opcional)</span>
          </label>
          <div className="relative flex items-start">
            <div className="absolute left-3.5 top-3 pointer-events-none text-slate-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <textarea
              id="edit-sale-notes"
              rows={2}
              placeholder="Garantía, color, serial, accesorios incluidos..."
              value={formData.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value || null)}
              className="w-full min-h-[58px] pl-10 pr-3.5 py-2 rounded-xl bg-[#0c111a] border border-[#222d3d] text-slate-100 placeholder-slate-500 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0084FF]/40 focus:border-[#0084FF] resize-none"
            />
          </div>
        </div>

        {/* Acciones del formulario */}
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

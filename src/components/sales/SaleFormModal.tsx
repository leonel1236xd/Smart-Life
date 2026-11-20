import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  Hash,
  DollarSign,
  FileText,
  PlusCircle,
  Minus,
  Plus,
  Laptop,
  Headphones,
  Coins,
} from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';
import { calculateCommission, inferCategoryFromProductName } from '../../lib/commissions';
import type { CreateSaleInput, ProductCategory, Sale } from '../../types';

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
    category: 'accesorio',
    quantity: 1,
    unit_price: null,
    notes: null,
  });
  const [hasManuallySelectedCategory, setHasManuallySelectedCategory] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Focus en el campo de producto al abrir solo en pantallas grandes para no abrir teclado bruscamente en móvil
  useEffect(() => {
    if (isOpen) {
      if (window.innerWidth >= 640) {
        setTimeout(() => {
          productRef.current?.focus();
        }, 150);
      }
    } else {
      // Resetear formulario al cerrar
      setFormData({
        product_name: '',
        category: 'accesorio',
        quantity: 1,
        unit_price: null,
        notes: null,
      });
      setHasManuallySelectedCategory(false);
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
      newErrors.quantity = 'Cantidad mayor a 0';
    } else if (!Number.isInteger(qty)) {
      newErrors.quantity = 'Número entero';
    }

    // Precio Unitario Obligatorio
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

    const qty = Math.max(1, Math.floor(Number(formData.quantity) || 1));
    const commAmount = calculateCommission(formData.category, qty);

    const payload: CreateSaleInput = {
      ...formData,
      quantity: qty,
      commission_amount: commAmount,
    };

    const result = await onSubmit(payload);

    if (result.error) {
      toast.error('Error al registrar la venta', result.error.message);
    } else if (result.data) {
      onClose();
      if (onSuccess) {
        onSuccess(result.data);
      }
    }
  };

  const handleFieldChange = (
    field: keyof CreateSaleInput,
    value: string | number | ProductCategory | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleProductNameChange = (value: string) => {
    handleFieldChange('product_name', value);
    // Si el usuario no ha forzado manualmente la categoría, auto-sugerir si escribe 'laptop'
    if (!hasManuallySelectedCategory && value.trim()) {
      const inferred = inferCategoryFromProductName(value);
      setFormData((prev) => ({ ...prev, product_name: value, category: inferred }));
    }
  };

  const handleCategorySelect = (category: ProductCategory) => {
    setHasManuallySelectedCategory(true);
    handleFieldChange('category', category);
  };

  const adjustQuantity = (delta: number) => {
    const current = Number(formData.quantity) || 1;
    const next = Math.max(1, current + delta);
    handleFieldChange('quantity', next);
  };

  // Cálculo de total a cobrar en vivo (solo producto, sin comisiones)
  const quantityNum = Number(formData.quantity) || 0;
  const priceNum = Number(formData.unit_price) || 0;
  const totalEstimado = quantityNum > 0 && priceNum > 0 ? quantityNum * priceNum : null;

  // Cálculo de la comisión del empleado en vivo (+5 Bs por accesorio, +50 Bs por laptop)
  const comisionUnitaria = formData.category === 'laptop' ? 50 : 5;
  const comisionTotalEstimada = quantityNum > 0 ? quantityNum * comisionUnitaria : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Venta"
      subtitle={profile ? `Registrando como: ${profile.full_name}` : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4" noValidate>
        {/* Producto */}
        <Input
          ref={productRef}
          label="Producto o accesorio"
          placeholder="Ej: Laptop Lenovo i5, Mouse Logitech, Cable HDMI..."
          value={formData.product_name}
          onChange={(e) => handleProductNameChange(e.target.value)}
          error={errors.product_name}
          required
          leftIcon={<Package className="w-4 h-4" />}
          autoComplete="off"
        />

        {/* Selector de Categoría: Accesorio (+5 Bs.) vs Laptop (+50 Bs.) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 tracking-wide flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>Tipo de artículo</span>
              <span className="text-rose-400">*</span>
            </span>
            <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              Comisión por venta
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {/* Botón Accesorio */}
            <button
              type="button"
              onClick={() => handleCategorySelect('accesorio')}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all text-left ${
                formData.category === 'accesorio'
                  ? 'bg-blue-950/70 border-blue-500 text-white shadow-md shadow-blue-950/40 ring-1 ring-blue-500/60'
                  : 'bg-[#0c111a] border-[#222d3d] text-slate-400 hover:text-white hover:border-[#2f3d52]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    formData.category === 'accesorio'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-[#151c28] text-slate-500'
                  }`}
                >
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs sm:text-sm font-semibold truncate">Accesorio</p>
                  <p className="text-[10px] text-slate-400">Mouse, cables, etc.</p>
                </div>
              </div>
              <span
                className={`shrink-0 ml-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  formData.category === 'accesorio'
                    ? 'bg-blue-500/30 text-blue-200 border border-blue-400/40'
                    : 'bg-[#141b27] text-slate-400 border border-[#233144]'
                }`}
              >
                +5 Bs.
              </span>
            </button>

            {/* Botón Laptop */}
            <button
              type="button"
              onClick={() => handleCategorySelect('laptop')}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all text-left ${
                formData.category === 'laptop'
                  ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/60'
                  : 'bg-[#0c111a] border-[#222d3d] text-slate-400 hover:text-white hover:border-[#2f3d52]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    formData.category === 'laptop'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-[#151c28] text-slate-500'
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs sm:text-sm font-semibold truncate">Laptop</p>
                  <p className="text-[10px] text-slate-400">Equipos portátiles</p>
                </div>
              </div>
              <span
                className={`shrink-0 ml-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  formData.category === 'laptop'
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                    : 'bg-[#141b27] text-slate-400 border border-[#233144]'
                }`}
              >
                +50 Bs.
              </span>
            </button>
          </div>
        </div>

        {/* Fila Cantidad y Precio */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          {/* Cantidad con stepper táctil integrado */}
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

          {/* Precio unitario (OBLIGATORIO) */}
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

        {/* Resumen dinámico: Total a cobrar al cliente + Comisión para el empleado */}
        <div className="space-y-2">
          {totalEstimado !== null && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#111722] border border-[#202d40] text-xs">
              <div>
                <span className="text-slate-400 font-medium">Total a cobrar (Cliente):</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {formData.quantity} {Number(formData.quantity) === 1 ? 'unidad' : 'unidades'} × {formatCurrency(formData.unit_price || 0)}
                </p>
              </div>
              <span className="text-base sm:text-lg font-bold text-white">
                {formatCurrency(totalEstimado)}
              </span>
            </div>
          )}

          {/* Caja destacada de Comisión para el vendedor */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-950/20 to-transparent border border-amber-500/35 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-amber-200 font-bold tracking-tight text-xs sm:text-sm">
                Comisión para el vendedor:
              </span>
            </div>
            <span className="text-base sm:text-lg font-extrabold text-amber-300">
              +{formatCurrency(comisionTotalEstimada)}
            </span>
          </div>
        </div>

        {/* Notas (opcional) */}
        <div className="w-full flex flex-col gap-1.5">
          <label htmlFor="sale-notes" className="text-xs font-semibold text-slate-300 tracking-wide">
            Notas u observaciones <span className="text-[11px] font-normal text-slate-500">(opcional)</span>
          </label>
          <div className="relative flex items-start">
            <div className="absolute left-3.5 top-3 pointer-events-none text-slate-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <textarea
              id="sale-notes"
              rows={2}
              placeholder="Garantía, color, serial, accesorios incluidos..."
              value={formData.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value || null)}
              className="w-full min-h-[56px] pl-10 pr-3.5 py-2 rounded-xl bg-[#0c111a] border border-[#222d3d] text-slate-100 placeholder-slate-500 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0084FF]/40 focus:border-[#0084FF] resize-none"
            />
          </div>
        </div>

        {/* Acciones del formulario */}
        <div className="flex gap-2.5 sm:gap-3 pt-1">
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
            icon={<PlusCircle className="w-4 h-4 stroke-[2.5]" />}
            className="flex-1 min-h-[46px]"
          >
            Registrar Venta
          </Button>
        </div>
      </form>
    </Modal>
  );
};

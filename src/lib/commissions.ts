import type {
  ProductCategory,
  Sale,
  EmployeeCommissionSummary,
  DailyCommissionsResult,
} from '../types';
import { calculateCommission, COMMISSION_RATES } from '../types';

export { COMMISSION_RATES, calculateCommission };

export const VALID_PRODUCT_CATEGORIES: ProductCategory[] = [
  'accesorio',
  'laptop',
  'monitor',
  'servicio_tecnico',
  'impresora',
  'tablet',
];

export interface CategoryConfig {
  key: ProductCategory;
  label: string;
  commissionLabel: string;
  rate: number;
  description: string;
  badgeClass: string;
}

export const CATEGORIES_CONFIG: Record<ProductCategory, CategoryConfig> = {
  accesorio: {
    key: 'accesorio',
    label: 'Accesorio',
    commissionLabel: '+5 Bs.',
    rate: 5,
    description: 'Mouse, teclados, cables, cargadores, etc. (+5 Bs. por ud.)',
    badgeClass: 'bg-blue-950/80 text-blue-300 border border-blue-500/30',
  },
  laptop: {
    key: 'laptop',
    label: 'Laptop',
    commissionLabel: '+50 Bs.',
    rate: 50,
    description: 'Equipos portátiles y notebooks (+50 Bs. por ud.)',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30',
  },
  monitor: {
    key: 'monitor',
    label: 'Monitor',
    commissionLabel: '+20 Bs.',
    rate: 20,
    description: 'Monitores y pantallas (+20 Bs. por ud.)',
    badgeClass: 'bg-violet-950/80 text-violet-300 border border-violet-500/30',
  },
  servicio_tecnico: {
    key: 'servicio_tecnico',
    label: 'Servicio Técnico',
    commissionLabel: '+20 Bs. (≥ 100 Bs.)',
    rate: 20,
    description: 'Mantenimiento y reparación (Cobro ≥ 100 Bs. → +20 Bs.)',
    badgeClass: 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30',
  },
  impresora: {
    key: 'impresora',
    label: 'Impresora',
    commissionLabel: '+10 Bs.',
    rate: 10,
    description: 'Impresoras y multifuncionales (+10 Bs. por ud.)',
    badgeClass: 'bg-rose-950/80 text-rose-300 border border-rose-500/30',
  },
  tablet: {
    key: 'tablet',
    label: 'Tablet',
    commissionLabel: '+20 Bs.',
    rate: 20,
    description: 'Tablets y iPads (+20 Bs. por ud.)',
    badgeClass: 'bg-amber-950/80 text-amber-300 border border-amber-500/30',
  },
};

export const PRODUCT_CATEGORIES_SELECT_OPTIONS: {
  value: ProductCategory;
  label: string;
}[] = [
  { value: 'accesorio', label: 'Accesorio (+5 Bs.)' },
  { value: 'laptop', label: 'Laptop (+50 Bs.)' },
  { value: 'monitor', label: 'Monitor (+20 Bs.)' },
  { value: 'servicio_tecnico', label: 'Servicio Técnico (≥ 100 Bs. → +20 Bs.)' },
  { value: 'impresora', label: 'Impresora (+10 Bs.)' },
  { value: 'tablet', label: 'Tablet (+20 Bs.)' },
];

/**
 * Retorna la categoría normalizada de una venta.
 * No realiza detección mágica/inteligente; utiliza la categoría explícita
 * o asigna 'accesorio' como valor seguro por defecto.
 */
export function getSaleCategory(sale: {
  category?: ProductCategory | string | null;
  product_name?: string;
}): ProductCategory {
  if (
    sale.category &&
    VALID_PRODUCT_CATEGORIES.includes(sale.category as ProductCategory)
  ) {
    return sale.category as ProductCategory;
  }
  return 'accesorio';
}

/**
 * Obtiene la comisión en Bolivianos (Bs.) para una venta individual.
 * Respeta el valor guardado en commission_amount si existe; de lo contrario
 * calcula la comisión con base en la categoría, cantidad y precio unitario.
 */
export function getSaleCommission(sale: {
  category?: ProductCategory | null;
  commission_amount?: number | null;
  product_name: string;
  quantity: number;
  unit_price?: number | null;
  total_amount?: number | null;
}): number {
  if (
    typeof sale.commission_amount === 'number' &&
    !isNaN(sale.commission_amount) &&
    sale.commission_amount >= 0
  ) {
    return sale.commission_amount;
  }

  const category = getSaleCategory(sale);
  const qty = Number(sale.quantity) || 1;
  const unitPrice =
    typeof sale.unit_price === 'number'
      ? sale.unit_price
      : typeof sale.total_amount === 'number' && qty > 0
      ? sale.total_amount / qty
      : 0;

  return calculateCommission(category, qty, unitPrice);
}

/**
 * Función central que calcula el total de comisiones de cada empleado
 * y el total general para el día de trabajo especificado.
 *
 * @param salesForDay Ventas registradas en el día
 * @param dateStr Fecha en formato YYYY-MM-DD
 */
export function calculateDailyCommissions(
  salesForDay: Sale[],
  dateStr: string
): DailyCommissionsResult {
  let total_store_commission = 0;
  let total_store_laptops = 0;
  let total_store_accesorios = 0;
  let total_store_units = 0;
  const total_store_category_units: Record<ProductCategory, number> = {
    accesorio: 0,
    laptop: 0,
    monitor: 0,
    servicio_tecnico: 0,
    impresora: 0,
    tablet: 0,
  };

  const by_employee: Record<string, EmployeeCommissionSummary> = {};

  for (const sale of salesForDay) {
    const empId = sale.employee_id || 'desconocido';
    const empName = sale.profiles?.full_name || 'Empleado';
    const empEmail = sale.profiles?.email || '';
    const empRole = sale.profiles?.role || 'employee';

    if (!by_employee[empId]) {
      by_employee[empId] = {
        employee_id: empId,
        employee_name: empName,
        employee_email: empEmail,
        role: empRole,
        laptop_units: 0,
        accesorio_units: 0,
        category_units: {
          accesorio: 0,
          laptop: 0,
          monitor: 0,
          servicio_tecnico: 0,
          impresora: 0,
          tablet: 0,
        },
        total_units: 0,
        total_sales_count: 0,
        total_commission: 0,
        sales: [],
      };
    }

    const qty = Number(sale.quantity) || 1;
    const category = getSaleCategory(sale);
    const commission = getSaleCommission(sale);

    if (category === 'laptop') {
      by_employee[empId].laptop_units += qty;
      total_store_laptops += qty;
    } else if (category === 'accesorio') {
      by_employee[empId].accesorio_units += qty;
      total_store_accesorios += qty;
    }

    if (by_employee[empId].category_units) {
      by_employee[empId].category_units[category] =
        (by_employee[empId].category_units[category] || 0) + qty;
    }
    total_store_category_units[category] =
      (total_store_category_units[category] || 0) + qty;

    by_employee[empId].total_units += qty;
    by_employee[empId].total_sales_count += 1;
    by_employee[empId].total_commission += commission;
    by_employee[empId].sales.push(sale);

    total_store_commission += commission;
    total_store_units += qty;
  }

  // Ordenar lista de empleados: mayor comisión primero
  const employee_list = Object.values(by_employee).sort(
    (a, b) => b.total_commission - a.total_commission
  );

  return {
    date: dateStr,
    total_store_commission,
    total_store_laptops,
    total_store_accesorios,
    total_store_units,
    total_store_category_units,
    by_employee,
    employee_list,
  };
}

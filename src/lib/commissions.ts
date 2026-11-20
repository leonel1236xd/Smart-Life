import type {
  ProductCategory,
  Sale,
  EmployeeCommissionSummary,
  DailyCommissionsResult,
} from '../types';
import { calculateCommission, COMMISSION_RATES } from '../types';

export { COMMISSION_RATES, calculateCommission };

const LAPTOP_KEYWORDS = [
  'laptop',
  'notebook',
  'portatil',
  'portátil',
  'macbook',
  'thinkpad',
  'ideapad',
  'pavilion',
  'zenbook',
  'vivobook',
  'legion',
  'victus',
  'predator',
  'nitro',
  'tuf',
  'rog',
  'alienware',
  'chromebook',
  'elitebook',
  'probook',
  'surface',
  'infinix',
];

/**
 * Deduce la categoría a partir del nombre del producto si no viene especificada.
 */
export function inferCategoryFromProductName(name: string): ProductCategory {
  if (!name) return 'accesorio';
  const lower = name.toLowerCase();
  const isLaptop = LAPTOP_KEYWORDS.some((kw) => lower.includes(kw));
  return isLaptop ? 'laptop' : 'accesorio';
}

/**
 * Retorna la categoría normalizada de una venta.
 */
export function getSaleCategory(sale: {
  category?: ProductCategory | null;
  product_name: string;
}): ProductCategory {
  if (sale.category === 'laptop' || sale.category === 'accesorio') {
    return sale.category;
  }
  return inferCategoryFromProductName(sale.product_name);
}

/**
 * Obtiene la comisión en Bolivianos (Bs.) para una venta individual.
 * - Laptop: +50 Bs. por unidad
 * - Accesorio: +5 Bs. por unidad
 */
export function getSaleCommission(sale: {
  category?: ProductCategory | null;
  commission_amount?: number | null;
  product_name: string;
  quantity: number;
}): number {
  if (typeof sale.commission_amount === 'number' && !isNaN(sale.commission_amount) && sale.commission_amount >= 0) {
    return sale.commission_amount;
  }
  const category = getSaleCategory(sale);
  const qty = Number(sale.quantity) || 1;
  return calculateCommission(category, qty);
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
    } else {
      by_employee[empId].accesorio_units += qty;
      total_store_accesorios += qty;
    }

    by_employee[empId].total_units += qty;
    by_employee[empId].total_sales_count += 1;
    by_employee[empId].total_commission += commission;
    by_employee[empId].sales.push(sale);

    total_store_commission += commission;
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
    by_employee,
    employee_list,
  };
}

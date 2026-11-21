export type UserRole = 'admin' | 'employee';

export type ProductCategory =
  | 'laptop'
  | 'accesorio'
  | 'monitor'
  | 'servicio_tecnico'
  | 'impresora'
  | 'tablet';

export const COMMISSION_RATES: Record<ProductCategory, number> = {
  laptop: 50,
  accesorio: 5,
  monitor: 20,
  servicio_tecnico: 20, // Aplica cuando el monto unitario/total es >= 100 Bs
  impresora: 10,
  tablet: 20,
};

export function calculateCommission(
  category: ProductCategory,
  quantity: number,
  unitPrice?: number | null
): number {
  const qty = Math.max(0, Math.floor(quantity));
  if (qty === 0) return 0;

  if (category === 'servicio_tecnico') {
    const price = typeof unitPrice === 'number' && !isNaN(unitPrice) ? unitPrice : 0;
    // Servicios técnicos: igual o mayores a 100 bs reciben 20 bs por unidad, menores reciben 0 bs
    return price >= 100 ? 20 * qty : 0;
  }

  const rate = COMMISSION_RATES[category] || 0;
  return rate * qty;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  product_name: string;
  category?: ProductCategory;
  commission_amount?: number;
  quantity: number;
  unit_price: number | null;
  total_amount: number | null;
  notes: string | null;
  employee_id: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
  } | null;
}

export interface CreateSaleInput {
  product_name: string;
  category: ProductCategory;
  quantity: number;
  unit_price?: number | null;
  notes?: string | null;
  commission_amount?: number;
}

export interface UpdateSaleInput {
  product_name: string;
  category?: ProductCategory;
  quantity: number;
  unit_price: number | null;
  notes?: string | null;
  commission_amount?: number;
}

export interface SalesFiltersState {
  day?: string; // YYYY-MM-DD
  month?: string; // YYYY-MM
  employee_id?: string;
  product_search?: string;
}

export interface SalesStats {
  today_sales_count: number;
  today_units_sold: number;
  today_total_amount: number;
  
  month_sales_count: number;
  month_units_sold: number;
  month_total_amount: number;
  
  overall_sales_count: number;
  overall_units_sold: number;
  overall_total_amount: number;
}

export interface EmployeeCommissionSummary {
  employee_id: string;
  employee_name: string;
  employee_email?: string;
  role?: UserRole;
  laptop_units: number;
  accesorio_units: number;
  category_units?: Record<ProductCategory, number>;
  total_units: number;
  total_sales_count: number;
  total_commission: number;
  sales: Sale[];
}

export interface DailyCommissionsResult {
  date: string; // YYYY-MM-DD
  total_store_commission: number;
  total_store_laptops: number;
  total_store_accesorios: number;
  total_store_units?: number;
  total_store_category_units?: Record<ProductCategory, number>;
  by_employee: Record<string, EmployeeCommissionSummary>;
  employee_list: EmployeeCommissionSummary[];
}

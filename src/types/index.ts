export type UserRole = 'admin' | 'employee';

export type ProductCategory = 'laptop' | 'accesorio';

export const COMMISSION_RATES: Record<ProductCategory, number> = {
  accesorio: 5,
  laptop: 50,
};

export function calculateCommission(category: ProductCategory, quantity: number): number {
  const rate = COMMISSION_RATES[category] || 0;
  const qty = Math.max(0, Math.floor(quantity));
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
  by_employee: Record<string, EmployeeCommissionSummary>;
  employee_list: EmployeeCommissionSummary[];
}

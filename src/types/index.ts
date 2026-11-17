export type UserRole = 'admin' | 'employee';

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
  quantity: number;
  unit_price?: number | null;
  notes?: string | null;
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

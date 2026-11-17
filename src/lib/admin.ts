import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Cliente Supabase secundario SIN persistencia de sesión.
 * Se utiliza exclusivamente para crear nuevos usuarios desde el panel admin
 * sin afectar la sesión del administrador actualmente autenticado.
 */
export function createAdminAuthClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export interface CreateEmployeeInput {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'employee';
}

/**
 * Crea un nuevo empleado usando signUp en un cliente aislado.
 * El trigger on_auth_user_created se encarga de crear el perfil.
 */
export async function createEmployee(input: CreateEmployeeInput): Promise<{ error: Error | null }> {
  const client = createAdminAuthClient();

  const { error } = await client.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        full_name: input.full_name.trim(),
        role: input.role,
      },
    },
  });

  if (error) {
    // Traducir errores comunes
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      return { error: new Error('Este correo ya está registrado') };
    }
    if (error.message.includes('password')) {
      return { error: new Error('La contraseña debe tener al menos 6 caracteres') };
    }
    return { error: new Error(error.message) };
  }

  return { error: null };
}

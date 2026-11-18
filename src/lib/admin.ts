import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { UserRole } from '../types';

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

export interface UpdateEmployeeInput {
  id: string;
  full_name: string;
  email?: string;
  password?: string;
  role: UserRole;
  active: boolean;
}

/**
 * Actualiza la información completa de un empleado:
 * - Nombre completo
 * - Correo electrónico
 * - Contraseña (opcional)
 * - Rol
 * - Estado de la cuenta (activo/inactivo)
 *
 * Utiliza la función RPC `admin_update_employee` con fallback a `public.profiles`.
 */
export async function updateEmployee(
  input: UpdateEmployeeInput
): Promise<{ error: Error | null; rpcMissing?: boolean }> {
  const cleanEmail = input.email ? input.email.trim().toLowerCase() : null;
  const cleanPass = input.password && input.password.trim().length > 0 ? input.password.trim() : null;
  const cleanName = input.full_name.trim();

  // 1. Invocar la función RPC admin_update_employee en Supabase
  const { error: rpcError } = await supabase.rpc('admin_update_employee', {
    target_user_id: input.id,
    new_full_name: cleanName,
    new_email: cleanEmail,
    new_password: cleanPass,
    new_role: input.role,
    new_active: input.active,
  });

  if (!rpcError) {
    return { error: null };
  }

  // 2. Comprobar si la función aún no existe en Supabase (error PGRST202 o mensaje de cache)
  const isRpcMissing =
    rpcError.code === 'PGRST202' ||
    rpcError.message?.toLowerCase().includes('could not find the function') ||
    rpcError.message?.toLowerCase().includes('schema cache');

  if (isRpcMissing) {
    // Fallback: guardar nombre, rol y estado en la tabla profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: cleanName,
        role: input.role,
        active: input.active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id);

    if (profileError) {
      return { error: new Error(profileError.message) };
    }

    // Si se intentó modificar email o password, avisar al admin que falta el script SQL
    if (cleanPass || cleanEmail) {
      return {
        error: new Error(
          'Se guardaron el nombre, rol y estado. Para actualizar también correo y contraseña, ejecuta el archivo "supabase_admin_update.sql" en el SQL Editor de tu Supabase.'
        ),
        rpcMissing: true,
      };
    }

    return { error: null };
  }

  // 3. Traducir errores de validación arrojados por la función SQL
  let errorMsg = rpcError.message;
  if (errorMsg.includes('correo ya está registrado') || errorMsg.includes('already registered')) {
    errorMsg = 'Ese correo electrónico ya pertenece a otro usuario registrado.';
  } else if (errorMsg.includes('contraseña debe tener al menos') || errorMsg.includes('password')) {
    errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
  } else if (errorMsg.includes('formato del correo')) {
    errorMsg = 'El formato del correo electrónico ingresado no es válido.';
  } else if (errorMsg.includes('No autorizado')) {
    errorMsg = 'Solo los administradores activos tienen permisos para editar empleados.';
  }

  return { error: new Error(errorMsg) };
}

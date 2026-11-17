-- ==============================================================================
-- SISTEMA DE REGISTRO Y CONTROL DE VENTAS - SMART LIFE
-- Computación · Tecnología · Innovación
-- Base de Datos PostgreSQL para Supabase
-- Zona horaria de referencia: America/La_Paz (UTC-4)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA: PROFILES (Perfiles de Empleados y Administradores)
-- Se vincula directamente con auth.users de Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Comentarios explicativos
COMMENT ON TABLE public.profiles IS 'Perfiles de usuario extendidos para empleados y administradores de Smart Life';
COMMENT ON COLUMN public.profiles.role IS 'Rol del usuario: admin (administrador) o employee (empleado)';

-- 3. TABLA: SALES (Registro de Ventas)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) DEFAULT NULL CHECK (unit_price IS NULL OR unit_price >= 0),
    total_amount NUMERIC(10, 2) DEFAULT NULL CHECK (total_amount IS NULL OR total_amount >= 0),
    notes TEXT DEFAULT NULL,
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.sales IS 'Ventas registradas en la tienda Smart Life con trazabilidad del empleado';
COMMENT ON COLUMN public.sales.quantity IS 'Cantidad entera vendida (mínimo 1 unidad)';
COMMENT ON COLUMN public.sales.unit_price IS 'Precio unitario opcional en Bolivianos (Bs.)';
COMMENT ON COLUMN public.sales.total_amount IS 'Monto total calculado (quantity * unit_price) si existe precio';

-- 4. ÍNDICES DE RENDIMIENTO PARA CONSULTAS Y FILTROS
CREATE INDEX IF NOT EXISTS idx_sales_created_at_desc ON public.sales (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_employee_id ON public.sales (employee_id);
CREATE INDEX IF NOT EXISTS idx_sales_product_name_trgm ON public.sales USING gin (to_tsvector('spanish', product_name));
CREATE INDEX IF NOT EXISTS idx_sales_product_lower ON public.sales (LOWER(product_name));
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles (active);

-- 5. FUNCIÓN Y TRIGGER: CALCULAR TOTAL_AMOUNT AUTOMÁTICAMENTE
CREATE OR REPLACE FUNCTION public.calculate_sale_total()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.unit_price IS NOT NULL AND NEW.unit_price >= 0 THEN
        NEW.total_amount := ROUND((NEW.quantity * NEW.unit_price)::numeric, 2);
    ELSE
        NEW.total_amount := NULL;
    END IF;
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sales_calculate_total ON public.sales;
CREATE TRIGGER tr_sales_calculate_total
    BEFORE INSERT OR UPDATE ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_sale_total();

-- 6. FUNCIÓN Y TRIGGER: SINCRONIZAR PERFIL AL CREAR USUARIO EN SUPABASE AUTH
-- Cuando un usuario se registra o es creado en Supabase Auth, se crea su perfil en profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_full_name TEXT;
    user_role TEXT;
BEGIN
    -- Extraer nombre completo de metadata o usar prefijo del email
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Extraer rol de metadata o asignar employee por defecto
    user_role := COALESCE(
        NEW.raw_user_meta_data->>'role',
        'employee'
    );
    
    IF user_role NOT IN ('admin', 'employee') THEN
        user_role := 'employee';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role, active)
    VALUES (NEW.id, NEW.email, user_full_name, user_role, true)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = timezone('utc'::text, now());

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 7. FUNCIÓN Y TRIGGER: PROTEGER ROLE Y ESTADO ACTIVE CONTRA MANIPULACIÓN
-- Garantiza que un usuario no pueda ascenderse a admin ni reactivarse a sí mismo
CREATE OR REPLACE FUNCTION public.check_profile_update()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si no es administrador activo, prohibir cambios en role o active
    IF NOT public.is_admin() THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'No tienes permisos para modificar el rol de usuario.';
        END IF;
        IF NEW.active IS DISTINCT FROM OLD.active THEN
            RAISE EXCEPTION 'No tienes permisos para modificar el estado de la cuenta.';
        END IF;
    END IF;
    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_profiles_protect_role_active ON public.profiles;
CREATE TRIGGER tr_profiles_protect_role_active
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_profile_update();

-- 8. FUNCIONES AUXILIARES DE SEGURIDAD (SECURITY DEFINER)
-- Permite validar el rol del usuario autenticado sin recursión en las políticas RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
          AND active = true
    );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
    SELECT role FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1;
$$;

-- 8. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- 9. POLÍTICAS DE SEGURIDAD: PROFILES
-- A. Lectura: Cualquier usuario autenticado puede ver perfiles activos
-- (necesario para mostrar nombres en el historial y lista de empleados)
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- B. Actualización: Los usuarios pueden actualizar su propio perfil, los admins pueden actualizar cualquiera
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = id OR public.is_admin()
    )
    WITH CHECK (
        auth.uid() = id OR public.is_admin()
    );

-- C. Inserción: Solo el trigger handle_new_user o administradores
DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
CREATE POLICY "profiles_insert_admin"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- 10. POLÍTICAS DE SEGURIDAD: SALES
-- A. Lectura: Todos los empleados autenticados pueden consultar el historial de ventas
DROP POLICY IF EXISTS "sales_select_authenticated" ON public.sales;
CREATE POLICY "sales_select_authenticated"
    ON public.sales
    FOR SELECT
    TO authenticated
    USING (true);

-- B. Inserción: El empleado solo puede registrar ventas a su propio nombre y si su cuenta está activa
-- Evita suplantación de identidad o registros por usuarios inhabilitados
DROP POLICY IF EXISTS "sales_insert_authenticated" ON public.sales;
CREATE POLICY "sales_insert_authenticated"
    ON public.sales
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = employee_id
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND active = true
        )
    );

-- C. Actualización: Solo administradores pueden modificar ventas pasadas
DROP POLICY IF EXISTS "sales_update_admin" ON public.sales;
CREATE POLICY "sales_update_admin"
    ON public.sales
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- D. Eliminación: Solo administradores pueden eliminar registros de ventas
DROP POLICY IF EXISTS "sales_delete_admin" ON public.sales;
CREATE POLICY "sales_delete_admin"
    ON public.sales
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 11. HABILITAR SUPABASE REALTIME PARA SALES Y PROFILES
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;


-- ==============================================================================
-- INSTRUCCIONES PARA CREAR EL PRIMER USUARIO ADMINISTRADOR:
--
-- Opción 1 (Desde Supabase Dashboard):
-- 1. Ve a "Authentication" -> "Users" -> "Add User" -> "Create User".
-- 2. Ingresa correo (ej: admin@smartlife.com) y contraseña segura.
-- 3. En el SQL Editor, ejecuta:
--    UPDATE public.profiles SET role = 'admin', full_name = 'Administrador Smart Life' WHERE email = 'admin@smartlife.com';
--
-- Opción 2 (SQL directo para crear usuario y perfil):
-- El trigger 'on_auth_user_created' creará automáticamente el perfil.
-- Solo debes actualizar su rol a 'admin'.
-- ==============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  isConfigured: boolean;
  authError: string | null;
  setAuthError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  // Función estricta para obtener y validar perfil
  const getVerifiedProfile = async (userId: string): Promise<Profile | null> => {
    if (!configured) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error al consultar perfil:', error.message);
        return null;
      }

      if (!data) {
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('Error al verificar perfil:', err);
      return null;
    }
  };

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    // 1. Verificar sesión existente al cargar la aplicación
    supabase.auth
      .getSession()
      .then(async ({ data: { session: currentSession } }) => {
        if (currentSession?.user) {
          const prof = await getVerifiedProfile(currentSession.user.id);

          // Si el perfil no existe o está inhabilitado (active === false), expulsar inmediatamente
          if (!prof || prof.active === false) {
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setProfile(null);
            if (prof && prof.active === false) {
              setAuthError(
                'Esta cuenta ha sido inhabilitada por un administrador. No tienes acceso al sistema.'
              );
            }
          } else {
            // Usuario legítimo y habilitado
            setProfile(prof);
            setUser(currentSession.user);
            setSession(currentSession);
          }
        } else {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      })
      .catch(() => {
        setUser(null);
        setSession(null);
        setProfile(null);
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Suscribirse a cambios de estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      // Ignoramos el evento SIGNED_OUT ya que limpiaremos explícitamente
      if (event === 'SIGNED_OUT' || !currentSession?.user) {
        setUser(null);
        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      // Si hay una sesión entrante, validar estrictamente contra la base de datos
      const prof = await getVerifiedProfile(currentSession.user.id);

      if (!prof || prof.active === false) {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setProfile(null);
        if (prof && prof.active === false) {
          setAuthError(
            'Esta cuenta ha sido inhabilitada por un administrador. No tienes acceso al sistema.'
          );
        }
        setLoading(false);
        return;
      }

      // Solo si el perfil está habilitado se le da acceso al estado
      setProfile(prof);
      setUser(currentSession.user);
      setSession(currentSession);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = async (email: string, password: string) => {
    if (!configured) {
      return {
        error: new Error(
          'Supabase no está configurado. Por favor añade tus credenciales en el archivo .env'
        ),
      };
    }

    setAuthError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoading(false);
      return { error };
    }

    if (data.user) {
      // Validar inmediatamente el estado en la tabla profiles
      const prof = await getVerifiedProfile(data.user.id);

      if (!prof || prof.active === false) {
        // Expulsar de inmediato sin dejar rastro de sesión
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setProfile(null);
        setLoading(false);

        const blockMsg =
          'Esta cuenta ha sido inhabilitada por un administrador. No tienes acceso al sistema.';
        setAuthError(blockMsg);
        return { error: new Error(blockMsg) };
      }

      // Si está activo, admitir
      setProfile(prof);
      setUser(data.user);
      setSession(data.session);
      setAuthError(null);
    }

    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    if (!configured) return;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setAuthError(null);
  };

  const refreshProfile = async () => {
    if (user) {
      const prof = await getVerifiedProfile(user.id);
      if (prof && prof.active !== false) {
        setProfile(prof);
      } else {
        await signOut();
      }
    }
  };

  // Solo es autenticado si user existe, profile existe y profile.active === true
  const isAuthenticated = Boolean(user && profile && profile.active === true);
  const isAdmin = isAuthenticated && profile?.role === 'admin';
  const isEmployee = isAuthenticated && (profile?.role === 'employee' || isAdmin);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAuthenticated,
        isAdmin,
        isEmployee,
        isConfigured: configured,
        authError,
        setAuthError,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

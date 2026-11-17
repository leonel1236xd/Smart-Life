import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, AlertTriangle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import logoImg from '../assets/logo.jpg';

export const LoginPage: React.FC = () => {
  const { signIn, isConfigured, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError || authError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLocalError(null);
    setAuthError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setLocalError('Ingresa tu correo electrónico');
      return;
    }
    if (!password) {
      setLocalError('Ingresa tu contraseña');
      return;
    }

    try {
      setLoading(true);
      const result = await signIn(trimmedEmail, password);

      if (result.error) {
        const msg = result.error.message || '';
        const lower = msg.toLowerCase();

        if (lower.includes('inhabilitada')) {
          setLocalError(msg);
        } else if (
          lower.includes('invalid login') ||
          lower.includes('invalid credentials') ||
          lower.includes('invalid_grant') ||
          lower.includes('credentials')
        ) {
          setLocalError('Correo o contraseña incorrectos');
        } else if (lower.includes('email not confirmed')) {
          setLocalError('Tu cuenta no ha sido confirmada en Supabase');
        } else if (lower.includes('configurado')) {
          setLocalError(msg);
        } else {
          setLocalError(msg || 'Error al iniciar sesión. Intenta de nuevo.');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al iniciar sesión';
      setLocalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (localError) setLocalError(null);
    if (authError) setAuthError(null);
  };

  return (
    <div className="min-h-dvh flex flex-col justify-center items-center bg-[#0b0e14] px-4 py-6 sm:py-10 relative overflow-hidden">
      {/* Luz ambiental sutil en el fondo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 bg-[#0084FF]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm mx-auto relative z-10"
      >
        {/* Identidad visual de Smart Life adaptada a móvil */}
        <div className="flex flex-col items-center mb-5 sm:mb-6 text-center">
          <img
            src={logoImg}
            alt="Smart Life"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-lg shadow-blue-950/60 mb-3 border border-[#1e2a3b]"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
            Smart Life
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Control de Ventas</p>
        </div>

        {/* Advertencia si no hay variables de entorno configuradas */}
        {!isConfigured && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/30 text-amber-200 mb-4"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-semibold mb-1">Supabase no está configurado</p>
              <p className="text-amber-300/80">
                Asegúrate de colocar tus credenciales correctas en el archivo <code className="bg-amber-900/40 px-1 rounded">.env</code>.
              </p>
            </div>
          </motion.div>
        )}

        {/* Tarjeta del formulario de login optimizada para pantallas móviles */}
        <div className="p-5 sm:p-7 rounded-2xl bg-[#111722]/95 border border-[#1c2738] shadow-2xl backdrop-blur-md">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">Iniciar sesión</h2>
            <p className="text-xs text-slate-400 mt-0.5">Ingresa con tus credenciales de empleado</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="nombre@smartlife.com"
              value={email}
              onChange={(e) => handleInputChange(setEmail, e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              inputMode="email"
              required
            />

            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => handleInputChange(setPassword, e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Mensaje de error destacado cuando las credenciales son incorrectas o la cuenta está inhabilitada */}
            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs leading-relaxed flex items-start gap-2.5 shadow-lg shadow-rose-950/40"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-100">{displayError}</p>
                </div>
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-1 min-h-[46px]"
              disabled={!isConfigured}
            >
              Ingresar al Sistema
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-5 tracking-wide">
          Computación · Tecnología · Innovación
        </p>
      </motion.div>
    </div>
  );
};

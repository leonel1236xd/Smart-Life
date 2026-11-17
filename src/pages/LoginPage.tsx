import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, AlertTriangle, Ban } from 'lucide-react';
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

    if (!email.trim()) {
      setLocalError('Ingresa tu correo electrónico');
      return;
    }
    if (!password) {
      setLocalError('Ingresa tu contraseña');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.error) {
      const msg = result.error.message;
      if (msg.includes('inhabilitada')) {
        setLocalError(msg);
      } else if (msg.includes('Invalid login') || msg.includes('invalid credentials')) {
        setLocalError('Correo o contraseña incorrectos');
      } else if (msg.includes('Email not confirmed')) {
        setLocalError('Tu cuenta no ha sido confirmada en Supabase');
      } else if (msg.includes('configurado')) {
        setLocalError(msg);
      } else {
        setLocalError(msg || 'Error al iniciar sesión. Intenta de nuevo.');
      }
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (localError) setLocalError(null);
    if (authError) setAuthError(null);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0b0e14] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        {/* Logo y título */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={logoImg}
            alt="Smart Life"
            className="w-20 h-20 rounded-2xl object-cover shadow-lg shadow-blue-950/40 mb-4"
          />
          <h1 className="text-xl font-bold text-white tracking-tight">Smart Life</h1>
          <p className="text-sm text-slate-400 mt-0.5">Control de Ventas</p>
        </div>

        {/* Advertencia de configuración */}
        {!isConfigured && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/30 text-amber-200 mb-5"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-semibold mb-1">Supabase no está configurado</p>
              <p className="text-amber-300/80">
                Crea un archivo <code className="bg-amber-900/40 px-1 rounded">.env</code> con tus credenciales
                de Supabase. Consulta el archivo <code className="bg-amber-900/40 px-1 rounded">.env.example</code> como referencia.
              </p>
            </div>
          </motion.div>
        )}

        {/* Card de login */}
        <div className="p-6 rounded-2xl bg-[#111722] border border-[#1c2738] shadow-xl">
          <h2 className="text-base font-bold text-white mb-1">Iniciar sesión</h2>
          <p className="text-xs text-slate-400 mb-5">Ingresa con tu cuenta de empleado</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="nombre@smartlife.com"
              value={email}
              onChange={(e) => handleInputChange(setEmail, e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
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
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Mensaje de error destacado */}
            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs leading-relaxed flex items-start gap-2.5 shadow-lg shadow-rose-950/40"
              >
                <Ban className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{displayError}</p>
                </div>
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
              disabled={!isConfigured}
            >
              Ingresar
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6">
          Computación · Tecnología · Innovación
        </p>
      </motion.div>
    </div>
  );
};

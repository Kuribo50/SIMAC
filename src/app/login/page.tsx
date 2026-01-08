"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "../actions/auth";
import { Lock, Mail, AlertCircle, Wrench } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginAction(email, password);

      if (result.success) {
        // Primero refresh para actualizar el estado del servidor
        router.refresh();
        // Luego redirigir a home
        window.location.href = "/";
      } else {
        setError(result.error || "Error al iniciar sesión");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 text-white rounded-2xl mb-4">
            <Wrench className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Mantenciones CAR</h1>
          <p className="text-zinc-500 mt-1 font-medium">
            Sistema de Gestión de Mantenciones
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-zinc-200 shadow-lg rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900">Iniciar Sesión</h2>
            <p className="text-sm text-zinc-500 mt-1 font-medium">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2 rounded-xl font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-zinc-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@cesfamcar.cl"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-zinc-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100">
            <p className="text-xs text-zinc-500 text-center font-medium">
              ¿Olvidaste tu contraseña? Contacta al administrador del sistema.
            </p>
          </div>
        </div>

        {/* Demo Credentials - Botones rápidos */}
        <div className="mt-6 p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm">
          <p className="text-sm font-bold text-zinc-700 mb-3">
            Acceso rápido (credenciales de prueba):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setEmail("admin@cesfamcar.cl");
                setPassword("admin123");
              }}
              className="p-3 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors text-center cursor-pointer rounded-xl"
            >
              <p className="text-xs font-bold text-red-600">Admin</p>
              <p className="text-[10px] text-red-500 mt-0.5 font-medium">
                Administrador
              </p>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setEmail("tecnico@cesfamcar.cl");
                setPassword("tecnico123");
              }}
              className="p-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors text-center cursor-pointer rounded-xl"
            >
              <p className="text-xs font-bold text-blue-600">Técnico</p>
              <p className="text-[10px] text-blue-500 mt-0.5 font-medium">
                Registrador
              </p>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setEmail("usuario@cesfamcar.cl");
                setPassword("usuario123");
              }}
              className="p-3 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 transition-colors text-center cursor-pointer rounded-xl"
            >
              <p className="text-xs font-bold text-zinc-700">Usuario</p>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">
                Visualizador
              </p>
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 text-center mt-3 font-medium">
            Haz clic en un rol y luego presiona &quot;Ingresar&quot;
          </p>
        </div>
      </div>
    </div>
  );
}

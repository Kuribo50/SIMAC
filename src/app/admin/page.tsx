import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUsers } from "../actions/auth";
import Link from "next/link";
import { Users, Settings, Shield, ChevronRight, History } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.rol !== "ADMINISTRADOR") {
    redirect("/");
  }

  const users = await getUsers();

  const stats = {
    totalUsers: users.length,
    admins: users.filter((u) => u.rol === "ADMINISTRADOR").length,
    registradores: users.filter((u) => u.rol === "REGISTRADOR").length,
    visualizadores: users.filter((u) => u.rol === "VISUALIZADOR").length,
    activos: users.filter((u) => u.activo).length,
    inactivos: users.filter((u) => !u.activo).length,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 text-white dark:bg-slate-800 rounded-2xl shadow-sm">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              Administración
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Panel de administración del sistema
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Total Usuarios
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                {stats.totalUsers}
              </p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform" />
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Activos
              </p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500 tracking-tight">
                {stats.activos}
              </p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full group-hover:scale-110 transition-transform" />
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Inactivos
              </p>
              <p className="text-3xl font-bold text-slate-400 dark:text-slate-500 tracking-tight">
                {stats.inactivos}
              </p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform" />
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                Administradores
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-500 tracking-tight">
                {stats.admins}
              </p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gestión de Usuarios */}
          <Link
            href="/admin/usuarios"
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-50 text-lg group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    Gestión de Usuarios
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">
                    Crear, editar y administrar usuarios del sistema
                  </p>
                  <div className="flex gap-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {stats.admins} admin
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {stats.registradores} registrador
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Roles y Permisos */}
          <Link
            href="/admin/roles"
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-50 text-lg group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                    Roles y Permisos
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">
                    Configura qué puede hacer cada rol en el sistema
                  </p>
                  <div className="flex gap-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      3 roles configurables
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Historial de Actividad */}
          <Link
            href="/admin/logs"
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-50 text-lg group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    Historial de Actividad
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">
                    Logs de todas las acciones en el sistema
                  </p>
                  <div className="flex gap-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Auditoría completa
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-amber-500 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        {/* Info de Roles */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              Descripción de Roles
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded-lg shrink-0">
                ADMINISTRADOR
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Acceso completo al sistema. Puede gestionar usuarios, ver toda
                la información, crear y editar mantenciones, y acceder a la
                configuración.
              </p>
            </div>
            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-lg shrink-0">
                REGISTRADOR
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Puede ver información y crear/editar mantenciones. No puede
                gestionar usuarios ni acceder a la configuración del sistema.
              </p>
            </div>
            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg shrink-0">
                VISUALIZADOR
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Solo puede ver información del sistema. No puede crear ni editar
                mantenciones ni acceder a funciones administrativas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

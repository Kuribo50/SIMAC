import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getAvailablePermissions,
  getPermissionsSummary,
} from "../../actions/permissions";
import Link from "next/link";
import { Shield, ArrowLeft, Users, Eye, Edit3 } from "lucide-react";
import RoleCard from "./RoleCard";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.rol !== "ADMINISTRADOR") {
    redirect("/");
  }

  const [{ bySection }, summary] = await Promise.all([
    getAvailablePermissions(),
    getPermissionsSummary(),
  ]);

  const roles = [
    {
      rol: "VISUALIZADOR" as const,
      nombre: "Visualizador",
      descripcion: "Solo puede ver información del sistema",
      color: "zinc",
      icon: Eye,
    },
    {
      rol: "REGISTRADOR" as const,
      nombre: "Registrador",
      descripcion: "Puede ver y registrar mantenciones",
      color: "blue",
      icon: Edit3,
    },
    {
      rol: "ADMINISTRADOR" as const,
      nombre: "Administrador",
      descripcion: "Acceso completo al sistema",
      color: "red",
      icon: Shield,
      locked: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Administración
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-600/20">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Roles y Permisos
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Configura los niveles de acceso y capacidades de cada rol en el
                sistema
              </p>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const stats = summary[role.rol];
            const Icon = role.icon;
            return (
              <div
                key={role.rol}
                className={`bg-white dark:bg-slate-900 border p-6 rounded-2xl shadow-sm relative overflow-hidden group transition-all duration-300 hover:shadow-md ${
                  role.locked
                    ? "opacity-90 border-slate-200 dark:border-slate-800"
                    : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                      role.color === "zinc"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        : role.color === "blue"
                        ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-50 text-lg">
                      {role.nombre}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-10 leading-relaxed">
                  {role.descripcion}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      Páginas
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                      {stats.pages}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      Acciones
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                      {stats.actions}
                    </span>
                  </div>
                </div>

                {role.locked && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg justify-center">
                    <Shield className="w-3 h-3" />
                    Permisos del sistema (Inmodificables)
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cards de Roles */}
        <div className="space-y-8">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
              Configuración Detallada
            </h2>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </div>

          {roles
            .filter((r) => !r.locked)
            .map((role) => (
              <RoleCard
                key={role.rol}
                rol={role.rol}
                nombre={role.nombre}
                descripcion={role.descripcion}
                color={role.color}
                permissionsBySection={bySection}
              />
            ))}
        </div>

        {/* Info Admin */}
        <div className="mt-10 bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 dark:text-amber-200">
              Rol de Administrador
            </h3>
            <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-1 leading-relaxed">
              El rol Administrador mantiene acceso total e irrestricto a todas
              las funcionalidades del sistema (Mantenciones, Usuarios,
              Configuración, etc.). Por razones de seguridad e integridad del
              sistema, sus permisos no aparecen en la lista de configuración
              editable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

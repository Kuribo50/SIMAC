import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUsers } from "@/app/actions/auth";
import UsersTable from "./UsersTable";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.rol !== "ADMINISTRADOR") {
    redirect("/");
  }

  const users = await getUsers();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors p-2 hover:bg-white dark:hover:bg-slate-900 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Administración
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Gestión de Usuarios
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Administra los accesos y roles del sistema ·{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {users.length} usuarios
                </span>
              </p>
            </div>
            <Link
              href="/admin/usuarios/nuevo"
              className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-xl shadow-lg shadow-slate-200 dark:shadow-slate-900/50 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Usuario
            </Link>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <UsersTable users={users} currentUserId={user.id} />
        </div>
      </div>
    </div>
  );
}

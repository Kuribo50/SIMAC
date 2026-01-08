import { getCurrentUser } from "@/lib/auth";
import { getRolePermissions } from "@/lib/permissions";
import { getCentros } from "@/app/actions/dashboard";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";
import GlobalConsole from "./GlobalConsole";
import Navbar from "./Navbar";

interface AppShellProps {
  children: React.ReactNode;
}

export default async function AppShell({ children }: AppShellProps) {
  const user = await getCurrentUser();

  // Si no hay usuario válido, redirigir a login
  if (!user) {
    redirect("/login");
  }

  // Obtener permisos del usuario
  const userPermissions = await getRolePermissions(user.rol);

  // Obtener centros para búsqueda
  const centros = await getCentros();

  return (
    <div className="flex h-screen overflow-hidden print:block bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Sidebar - Hidden in Print */}
      <div className="print:hidden h-full">
        <Sidebar user={user} permissions={userPermissions} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
        {/* New Navbar */}
        <div className="print:hidden">
          <Navbar user={user} centros={centros} />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto print:overflow-visible print:p-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {children}
        </main>
      </div>

      {/* Global Real-time Console for Admins */}
      <GlobalConsole userRole={user.rol} />
    </div>
  );
}

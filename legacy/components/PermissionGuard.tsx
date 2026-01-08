import { getCurrentUser } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface PermissionGuardProps {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Componente de servidor que protege contenido basado en permisos.
 * Si el usuario no tiene el permiso requerido, redirige o muestra el fallback.
 */
export async function PermissionGuard({
  children,
  permission,
  fallback,
  redirectTo,
}: PermissionGuardProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const hasAccess = await hasPermission(user.rol, permission);

  if (!hasAccess) {
    if (redirectTo) {
      redirect(redirectTo);
    }
    return fallback || <AccessDenied />;
  }

  return <>{children}</>;
}

/**
 * Componente de acceso denegado por defecto
 */
function AccessDenied() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="bg-white border border-zinc-200 p-8 max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 mb-2">
          Acceso Denegado
        </h2>
        <p className="text-zinc-600 mb-6">
          No tienes permisos para acceder a esta sección. Contacta al
          administrador si crees que esto es un error.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800"
        >
          Volver al Inicio
        </a>
      </div>
    </div>
  );
}

/**
 * HOC para verificar permisos en server components
 */
export async function checkPermission(permission: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return hasPermission(user.rol, permission);
}

/**
 * Hook helper para obtener los códigos de permisos
 */
export { PERMISSIONS };

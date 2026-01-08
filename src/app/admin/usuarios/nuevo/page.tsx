import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import CreateUserForm from "./CreateUserForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NuevoUsuarioPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.rol !== "ADMINISTRADOR") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/usuarios"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Usuarios
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Nuevo Usuario
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Crear una nueva cuenta de usuario en el sistema
          </p>
        </div>

        {/* Form */}
        <CreateUserForm />
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "../actions/auth";
import { LogOut, User, Shield, LogIn } from "lucide-react";
import { RolUsuario } from "@prisma/client";

interface UserMenuProps {
  user: {
    name: string | null;
    email: string;
    rol: RolUsuario;
  } | null;
  collapsed?: boolean;
}

export default function UserMenu({ user, collapsed }: UserMenuProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    // Usar window.location para forzar recarga completa
    window.location.href = "/login";
  };

  const getRolLabel = (rol: RolUsuario) => {
    switch (rol) {
      case "ADMINISTRADOR":
        return "Admin";
      case "REGISTRADOR":
        return "Registrador";
      case "VISUALIZADOR":
        return "Visualizador";
    }
  };

  const getRolColor = (rol: RolUsuario) => {
    switch (rol) {
      case "ADMINISTRADOR":
        return "text-red-600 bg-red-50";
      case "REGISTRADOR":
        return "text-blue-600 bg-blue-50";
      case "VISUALIZADOR":
        return "text-zinc-600 bg-zinc-100";
    }
  };

  // Si no hay usuario, mostrar botón de login
  if (!user) {
    if (collapsed) {
      return (
        <Link
          href="/login"
          className="flex items-center justify-center p-2 bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl"
          title="Iniciar Sesión"
        >
          <LogIn className="w-5 h-5 text-zinc-500" />
        </Link>
      );
    }
    return (
      <Link
        href="/login"
        className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all rounded-xl"
      >
        <div className="w-9 h-9 bg-zinc-100 flex items-center justify-center rounded-lg">
          <LogIn className="w-5 h-5 text-zinc-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-700">Iniciar Sesión</p>
          <p className="text-xs text-zinc-500">Accede al sistema</p>
        </div>
      </Link>
    );
  }

  if (collapsed) {
    return (
      <div className="flex justify-center">
        <button
          onClick={handleLogout}
          className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors rounded-xl"
          title={`Cerrar sesión (${user.name})`}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Info del usuario */}
      <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
        <div className="w-9 h-9 bg-zinc-200 flex items-center justify-center rounded-lg">
          <User className="w-5 h-5 text-zinc-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 truncate">
            {user.name || "Usuario"}
          </p>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-zinc-400" />
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${getRolColor(
                user.rol
              )}`}
            >
              {getRolLabel(user.rol)}
            </span>
          </div>
        </div>
      </div>

      {/* Botón de cerrar sesión - ROJO */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-600 hover:bg-red-700 text-white font-bold transition-colors rounded-xl"
      >
        <LogOut className="w-4 h-4" />
        Cerrar Sesión
      </button>
    </div>
  );
}

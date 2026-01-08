"use client";

import { useEffect, useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { RolUsuario } from "@prisma/client";
import {
  Bell,
  Clock,
  Users,
  LogOut,
  User as UserIcon,
  Menu,
} from "lucide-react";
import NavbarSearch from "./NavbarSearch";
import { logoutAction } from "@/app/actions/auth";
import Link from "next/link";
import NotificacionesBell from "./NotificacionesBell";

interface NavbarProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    rol: RolUsuario;
  } | null;
  centros?: string[]; // Para búsqueda
}

export default function Navbar({ user, centros = [] }: NavbarProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [activeUsers, setActiveUsers] = useState(3);
  const [isScrolled, setIsScrolled] = useState(false);

  // Reloj
  useEffect(() => {
    // Set initial time to avoid hydration mismatch
    setCurrentTime(
      new Date().toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 1000); // Actualizar cada segundo para precisión, aunque mostremos minutos

    return () => clearInterval(interval);
  }, []);

  // Simulación de usuarios activos (variación aleatoria ligera)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const next = prev + change;
        return next > 1 && next < 8 ? next : prev;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Detect scroll for backdrop effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = "/login";
  };

  const firstName =
    user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Usuario";

  return (
    <header
      className={`
        sticky top-0 z-30 flex items-center justify-between px-6 h-16 transition-all duration-300
        ${
          isScrolled
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-stone-200/50 dark:border-slate-800/50"
            : "bg-white dark:bg-slate-900 border-b border-stone-200 dark:border-slate-800"
        }
      `}
    >
      {/* Mobile Trigger (Placeholder - handled by AppShell usually but good to have icon) */}
      <div className="lg:hidden mr-4">
        <Menu className="w-6 h-6 text-slate-600 dark:text-slate-400" />
      </div>

      {/* Search Bar - Expanded & Centered */}
      <div className="flex-1 max-w-2xl mx-auto hidden md:block">
        <NavbarSearch centros={centros} />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-4">
        {/* Info Pills (Hidden on small screens) */}
        <div className="hidden xl:flex items-center gap-2 mr-2">
          {/* Active Users */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium border border-emerald-100 dark:border-emerald-500/20"
            title="Usuarios activos ahora"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{activeUsers} activos</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium border border-stone-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5" />
            <span>{currentTime}</span>
          </div>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-stone-200 dark:bg-slate-800 hidden lg:block" />

        <div className="flex items-center gap-2">
          <NotificacionesBell />
          <ModeToggle />
        </div>

        {/* User Profile Dropdown/Menu */}
        {user && (
          <div className="flex items-center gap-3 pl-2 group relative">
            <div className="text-right hidden sm:block leading-tight">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {firstName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                {user.rol.toLowerCase()}
              </p>
            </div>
            <button
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-md ring-2 ring-transparent group-hover:ring-blue-200 dark:group-hover:ring-blue-900 transition-all"
              title="Perfil de Usuario"
            >
              <span className="font-bold text-sm">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </button>

            {/* Simple Custom Dropdown on Hover/Click (CSS Group based) */}
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-stone-200 dark:border-slate-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50 p-1">
              <div className="p-3 border-b border-stone-100 dark:border-slate-800 mb-1 lg:hidden">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>

              <Link
                href="/admin/usuarios"
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>Mi Perfil</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

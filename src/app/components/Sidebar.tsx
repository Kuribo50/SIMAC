"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RolUsuario } from "@prisma/client";
import {
  ChevronDown,
  LayoutDashboard,
  Calendar,
  ClipboardList,
  AlertCircle,
  History,
  Users,
  Settings,
  Shield,
  FileText,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Search,
  Box,
  MapPin,
  List,
  Sliders,
  BarChart3,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  highlight?: boolean;
}

interface NavSection {
  title: string;
  icon?: React.ReactNode;
  items: NavItem[];
  adminOnly?: boolean;
}

interface SidebarProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    rol: RolUsuario;
  } | null;
  permissions: string[];
}

const navigation: NavSection[] = [
  {
    title: "Principal",
    items: [
      {
        href: "/",
        label: "Inicio",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        href: "/planificacion",
        label: "Calendario",
        icon: <Calendar className="w-5 h-5" />,
      },
    ],
  },
  {
    title: "Mantenciones",
    icon: <ClipboardList className="w-5 h-5" />,
    items: [
      {
        href: "/mantenciones/nueva",
        label: "Nueva Orden",
        icon: <PlusCircle className="w-5 h-5" />,
        highlight: true,
      },
      {
        href: "/mantenciones/pendientes",
        label: "Pendientes",
        badge: "!",
        icon: <AlertCircle className="w-5 h-5" />,
      },
      {
        href: "/mantenciones/historial",
        label: "Historial",
        icon: <History className="w-5 h-5" />,
      },
    ],
  },
  {
    title: "Inventario",
    icon: <Box className="w-5 h-5" />,
    items: [
      {
        href: "/equipos",
        label: "Equipos",
        icon: <Box className="w-5 h-5" />,
      },
      {
        href: "/ubicaciones",
        label: "Ubicaciones",
        icon: <MapPin className="w-5 h-5" />,
      },
      {
        href: "/pautas",
        label: "Pautas",
        icon: <List className="w-5 h-5" />,
      },
    ],
  },
  {
    title: "Administración",
    icon: <Settings className="w-5 h-5" />,
    adminOnly: true,
    items: [
      {
        href: "/admin",
        label: "Dashboard Admin",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        href: "/admin/usuarios",
        label: "Usuarios",
        icon: <Users className="w-5 h-5" />,
      },
      {
        href: "/admin/roles",
        label: "Roles y Permisos",
        icon: <Shield className="w-5 h-5" />,
      },
      {
        href: "/admin/logs",
        label: "Logs del Sistema",
        icon: <FileText className="w-5 h-5" />,
      },
      {
        href: "/analitica",
        label: "Analítica",
        icon: <BarChart3 className="w-5 h-5" />,
      },
      {
        href: "/admin/parametros",
        label: "Parámetros",
        icon: <Sliders className="w-5 h-5" />,
      },
    ],
  },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Mantenciones",
    "Inventario",
    "Administración",
  ]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto-expand section based on current path
  useEffect(() => {
    navigation.forEach((section) => {
      if (section.items.some((item) => pathname.startsWith(item.href))) {
        if (!expandedSections.includes(section.title)) {
          setExpandedSections((prev) => [...prev, section.title]);
        }
      }
    });
  }, [pathname]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = "/login";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 h-16 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/20 dark:shadow-blue-900/50">
          M
        </div>
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            <h1 className="font-bold text-slate-800 dark:text-slate-100 truncate">
              Mantenciones
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
              Cesfam Alberto Reyes
            </p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ml-auto hidden md:block"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white ml-auto"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {navigation.map((section) => {
          if (section.adminOnly && user?.rol !== "ADMINISTRADOR") return null;

          if (section.title === "Principal") {
            return (
              <div key={section.title} className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                      pathname === item.href
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center transition-colors",
                        item.highlight ? "text-blue-500 dark:text-blue-400" : ""
                      )}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="text-sm flex-1">{item.label}</span>
                    )}
                    {item.badge && !collapsed && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            );
          }

          const isExpanded = expandedSections.includes(section.title);

          return (
            <div key={section.title} className="space-y-1">
              {!collapsed ? (
                <>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      {section.icon && (
                        <span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                          {section.icon}
                        </span>
                      )}
                      <span>{section.title}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-3 h-3 transition-transform duration-200",
                        isExpanded ? "transform rotate-180" : ""
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 pl-2">
                          {" "}
                          {/* Indent */}
                          {section.items.map((item) => {
                            const isActive =
                              pathname === item.href ||
                              pathname.startsWith(item.href + "/");
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                                  isActive
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                                )}
                              >
                                {item.icon &&
                                  React.cloneElement(
                                    item.icon as React.ReactElement<{
                                      className?: string;
                                    }>,
                                    { className: "w-4 h-4" }
                                  )}
                                <span>{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-colors relative group",
                          isActive
                            ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                        title={item.label}
                      >
                        {item.icon}
                        {item.badge && (
                          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed ? "justify-center" : ""
          )}
        >
          {!collapsed ? (
            <>
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 truncate capitalize">
                  {user?.rol.toLowerCase()}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 md:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out shrink-0",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
}

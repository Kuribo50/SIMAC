"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Trash2, ExternalLink, X } from "lucide-react";
import {
  getNotificaciones,
  contarNotificacionesNoLeidas,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  eliminarNotificacion,
  verificarMantencionesProximas,
} from "@/app/actions/notificaciones";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt: Date;
  mantencionId?: string | null;
  equipoId?: string | null;
  mantencion?: {
    id: string;
    equipo: {
      id: string;
      nombre: string;
    };
  } | null;
}

export default function NotificacionesBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [conteoNoLeidas, setConteoNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar notificaciones
  const cargarNotificaciones = async () => {
    setLoading(true);
    try {
      const [notifs, count] = await Promise.all([
        getNotificaciones({ limite: 20 }),
        contarNotificacionesNoLeidas(),
      ]);
      setNotificaciones(notifs as Notificacion[]);
      setConteoNoLeidas(count);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar mantenciones próximas al cargar
  useEffect(() => {
    const verificar = async () => {
      try {
        await verificarMantencionesProximas();
        await cargarNotificaciones();
      } catch (error) {
        console.error("Error verificando mantenciones:", error);
      }
    };
    verificar();

    // Actualizar cada 5 minutos
    const interval = setInterval(() => {
      verificar();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarcarLeida = async (id: string) => {
    await marcarNotificacionLeida(id);
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
    setConteoNoLeidas((prev) => Math.max(0, prev - 1));
  };

  const handleMarcarTodasLeidas = async () => {
    await marcarTodasLeidas();
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    setConteoNoLeidas(0);
  };

  const handleEliminar = async (id: string) => {
    const notif = notificaciones.find((n) => n.id === id);
    await eliminarNotificacion(id);
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    if (notif && !notif.leida) {
      setConteoNoLeidas((prev) => Math.max(0, prev - 1));
    }
  };

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case "MANTENCION_HOY":
        return "🔔";
      case "MANTENCION_PROXIMA":
        return "📅";
      case "MANTENCION_ATRASADA":
        return "⚠️";
      case "MANTENCION_FIRMADA":
        return "✍️";
      case "MANTENCION_COMPLETADA":
        return "✅";
      case "MANTENCION_PROGRAMADA":
        return "📋";
      default:
        return "📢";
    }
  };

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case "MANTENCION_HOY":
        return "bg-blue-50 border-blue-200";
      case "MANTENCION_PROXIMA":
        return "bg-amber-50 border-amber-200";
      case "MANTENCION_ATRASADA":
        return "bg-red-50 border-red-200";
      case "MANTENCION_FIRMADA":
        return "bg-purple-50 border-purple-200";
      case "MANTENCION_COMPLETADA":
        return "bg-green-50 border-green-200";
      case "MANTENCION_PROGRAMADA":
        return "bg-indigo-50 border-indigo-200";
      default:
        return "bg-zinc-50 border-zinc-200";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de campana */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) cargarNotificaciones();
        }}
        className="relative p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {conteoNoLeidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {conteoNoLeidas > 9 ? "9+" : conteoNoLeidas}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-zinc-200 z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-zinc-50">
            <h3 className="font-semibold text-zinc-800">Notificaciones</h3>
            <div className="flex items-center gap-2">
              {conteoNoLeidas > 0 && (
                <button
                  onClick={handleMarcarTodasLeidas}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="w-4 h-4" />
                  Marcar todas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-zinc-200 rounded"
              >
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-zinc-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400 mx-auto"></div>
                <p className="mt-2 text-sm">Cargando...</p>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                <p className="font-medium">No hay notificaciones</p>
                <p className="text-sm mt-1">
                  Te avisaremos cuando haya mantenciones próximas
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-zinc-50 transition-colors ${
                      !notif.leida ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icono */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg border ${getColorTipo(
                          notif.tipo
                        )}`}
                      >
                        {getIconoTipo(notif.tipo)}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm font-medium ${
                              !notif.leida ? "text-zinc-900" : "text-zinc-600"
                            }`}
                          >
                            {notif.titulo}
                          </p>
                          {!notif.leida && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5"></span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 mt-0.5 line-clamp-2">
                          {notif.mensaje}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-zinc-400">
                            {formatDistanceToNow(new Date(notif.createdAt), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>

                          {/* Acciones */}
                          <div className="flex items-center gap-1 ml-auto">
                            {notif.mantencionId && (
                              <Link
                                href={`/mantenciones/${notif.mantencionId}/visualizar`}
                                onClick={() => {
                                  handleMarcarLeida(notif.id);
                                  setIsOpen(false);
                                }}
                                className="p-1 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="Ver mantención"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            )}
                            {!notif.leida && (
                              <button
                                onClick={() => handleMarcarLeida(notif.id)}
                                className="p-1 text-zinc-400 hover:text-green-600 hover:bg-green-50 rounded"
                                title="Marcar como leída"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEliminar(notif.id)}
                              className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notificaciones.length > 0 && (
            <div className="p-3 border-t border-zinc-200 bg-zinc-50">
              <Link
                href="/notificaciones"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todas las notificaciones
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

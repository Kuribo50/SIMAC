"use client";

import { useState, useEffect } from "react";
import {
  getNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  eliminarNotificacion,
  verificarMantencionesProximas,
} from "@/app/actions/notificaciones";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Filter,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSignature,
} from "lucide-react";

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

type FiltroTipo =
  | "todas"
  | "no-leidas"
  | "mantenciones"
  | "firmas"
  | "atrasadas";

export default function NotificacionesContent() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroTipo>("todas");
  const [actualizando, setActualizando] = useState(false);

  const cargarNotificaciones = async () => {
    setLoading(true);
    try {
      await verificarMantencionesProximas();
      const notifs = await getNotificaciones({ limite: 100 });
      setNotificaciones(notifs as Notificacion[]);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const handleActualizar = async () => {
    setActualizando(true);
    try {
      await verificarMantencionesProximas();
      await cargarNotificaciones();
    } finally {
      setActualizando(false);
    }
  };

  const handleMarcarLeida = async (id: string) => {
    await marcarNotificacionLeida(id);
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  };

  const handleMarcarTodasLeidas = async () => {
    await marcarTodasLeidas();
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const handleEliminar = async (id: string) => {
    await eliminarNotificacion(id);
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  };

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case "MANTENCION_HOY":
        return <Bell className="w-5 h-5 text-blue-600" />;
      case "MANTENCION_PROXIMA":
        return <Calendar className="w-5 h-5 text-amber-600" />;
      case "MANTENCION_ATRASADA":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "MANTENCION_FIRMADA":
        return <FileSignature className="w-5 h-5 text-purple-600" />;
      case "MANTENCION_COMPLETADA":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "MANTENCION_PROGRAMADA":
        return <Clock className="w-5 h-5 text-indigo-600" />;
      default:
        return <Bell className="w-5 h-5 text-zinc-600" />;
    }
  };

  const getColorBorde = (tipo: string) => {
    switch (tipo) {
      case "MANTENCION_HOY":
        return "border-l-blue-500";
      case "MANTENCION_PROXIMA":
        return "border-l-amber-500";
      case "MANTENCION_ATRASADA":
        return "border-l-red-500";
      case "MANTENCION_FIRMADA":
        return "border-l-purple-500";
      case "MANTENCION_COMPLETADA":
        return "border-l-green-500";
      case "MANTENCION_PROGRAMADA":
        return "border-l-indigo-500";
      default:
        return "border-l-zinc-500";
    }
  };

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones.filter((n) => {
    switch (filtro) {
      case "no-leidas":
        return !n.leida;
      case "mantenciones":
        return [
          "MANTENCION_HOY",
          "MANTENCION_PROXIMA",
          "MANTENCION_PROGRAMADA",
        ].includes(n.tipo);
      case "firmas":
        return n.tipo === "MANTENCION_FIRMADA";
      case "atrasadas":
        return n.tipo === "MANTENCION_ATRASADA";
      default:
        return true;
    }
  });

  // Estadísticas
  const stats = {
    total: notificaciones.length,
    noLeidas: notificaciones.filter((n) => !n.leida).length,
    atrasadas: notificaciones.filter((n) => n.tipo === "MANTENCION_ATRASADA")
      .length,
    proximas: notificaciones.filter((n) =>
      ["MANTENCION_HOY", "MANTENCION_PROXIMA"].includes(n.tipo)
    ).length,
  };

  if (loading) {
    return (
      <div className="bg-white p-12 border border-zinc-200 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-400 mx-auto"></div>
        <p className="mt-4 text-zinc-500">Cargando notificaciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <Bell className="w-5 h-5 text-zinc-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
              <p className="text-sm text-zinc-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {stats.noLeidas}
              </p>
              <p className="text-sm text-zinc-500">No leídas</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {stats.proximas}
              </p>
              <p className="text-sm text-zinc-500">Próximas</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {stats.atrasadas}
              </p>
              <p className="text-sm text-zinc-500">Atrasadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-zinc-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Filtros */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-zinc-400" />
            {[
              { key: "todas", label: "Todas" },
              { key: "no-leidas", label: "No leídas" },
              { key: "mantenciones", label: "Próximas" },
              { key: "atrasadas", label: "Atrasadas" },
              { key: "firmas", label: "Firmas" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key as FiltroTipo)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filtro === f.key
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleActualizar}
              disabled={actualizando}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-100 text-zinc-600 hover:bg-zinc-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${actualizando ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
            {stats.noLeidas > 0 && (
              <button
                onClick={handleMarcarTodasLeidas}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Marcar todas leídas
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="bg-white border border-zinc-200">
        {notificacionesFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-zinc-200" />
            <p className="text-lg font-medium text-zinc-600">
              No hay notificaciones
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              {filtro === "todas"
                ? "Te avisaremos cuando haya mantenciones próximas o actualizaciones"
                : "No hay notificaciones con este filtro"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {notificacionesFiltradas.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 border-l-4 ${getColorBorde(notif.tipo)} ${
                  !notif.leida ? "bg-blue-50/30" : "hover:bg-zinc-50"
                } transition-colors`}
              >
                <div className="flex gap-4">
                  {/* Icono */}
                  <div className="flex-shrink-0 mt-1">
                    {getIconoTipo(notif.tipo)}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3
                          className={`font-medium ${
                            !notif.leida ? "text-zinc-900" : "text-zinc-700"
                          }`}
                        >
                          {notif.titulo}
                        </h3>
                        <p className="text-sm text-zinc-500 mt-1">
                          {notif.mensaje}
                        </p>
                      </div>
                      {!notif.leida && (
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-zinc-400">
                        {format(new Date(notif.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: es,
                        })}{" "}
                        •{" "}
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
                            onClick={() => handleMarcarLeida(notif.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Ver mantención
                          </Link>
                        )}
                        {!notif.leida && (
                          <button
                            onClick={() => handleMarcarLeida(notif.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            Marcar leída
                          </button>
                        )}
                        <button
                          onClick={() => handleEliminar(notif.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Eliminar
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
    </div>
  );
}

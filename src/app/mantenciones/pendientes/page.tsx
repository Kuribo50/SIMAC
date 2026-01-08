"use server";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { EstadoMantencion } from "@prisma/client";
import MantencionesPendientesList from "../components/MantencionesPendientesList";
import {
  Clock,
  RefreshCw,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  Plus,
} from "lucide-react";

// Obtener mantenciones pendientes y en proceso
async function getMantencionesPendientes() {
  const mantenciones = await prisma.mantencion.findMany({
    where: {
      estadoMantencion: {
        in: [EstadoMantencion.PENDIENTE, EstadoMantencion.EN_PROCESO],
      },
    },
    include: {
      equipo: {
        include: {
          ubicacion: true,
          tipoEquipo: true,
        },
      },
      pauta: {
        include: {
          _count: {
            select: { items: true },
          },
        },
      },
      respuestas: {
        where: { isCompleted: true },
      },
      firmas: true,
    },
    orderBy: [{ fecha: "asc" }, { createdAt: "desc" }],
  });
  return mantenciones;
}

// Obtener pautas activas para el modal
async function getPautasActivas() {
  const pautas = await prisma.pautaMantenimiento.findMany({
    where: {
      activo: true,
    },
    include: {
      _count: {
        select: { items: true },
      },
    },
    orderBy: { nombre: "asc" },
  });
  return pautas;
}

export default async function MantencionesPendientesPage() {
  const [mantenciones, pautas] = await Promise.all([
    getMantencionesPendientes(),
    getPautasActivas(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Mantenciones Pendientes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Ejecuta y firma las mantenciones programadas
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/mantenciones/historial"
            className="px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all shadow-sm"
          >
            Ver Historial
          </Link>
          <Link
            href="/planificacion"
            className="px-4 py-2.5 text-sm bg-slate-900 dark:bg-slate-800 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            Programar Nueva
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">
                Pendientes
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {
                  mantenciones.filter(
                    (m) => m.estadoMantencion === EstadoMantencion.PENDIENTE
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">
                En Proceso
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {
                  mantenciones.filter(
                    (m) => m.estadoMantencion === EstadoMantencion.EN_PROCESO
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">
                Sin Pauta
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {mantenciones.filter((m) => !m.pauta).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <ClipboardList className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">
                Total
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {mantenciones.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de mantenciones */}
      {mantenciones.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            ¡Todo al día!
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            No hay mantenciones pendientes en este momento.
          </p>
          <Link
            href="/planificacion"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Programar Mantención
          </Link>
        </div>
      ) : (
        <MantencionesPendientesList
          mantenciones={mantenciones.map((m) => ({
            ...m,
            equipo: m.equipo
              ? {
                  modelo: m.equipo.modelo,
                  serie: m.equipo.serie,
                  tipoEquipo: m.equipo.tipoEquipo
                    ? { subcategoria: m.equipo.tipoEquipo.subcategoria }
                    : null,
                  ubicacion: m.equipo.ubicacion
                    ? {
                        area: m.equipo.ubicacion.area,
                        establecimiento: m.equipo.ubicacion.establecimiento,
                      }
                    : null,
                }
              : null,
            pauta: m.pauta
              ? {
                  id: m.pauta.id,
                  nombre: m.pauta.nombre,
                  _count: m.pauta._count,
                }
              : null,
          }))}
          pautas={pautas}
        />
      )}
    </div>
  );
}

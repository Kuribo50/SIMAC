import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getMantencionCompleta } from "@/app/actions/mantenciones";
import { hasRequiredSignatures } from "@/app/actions/firmas";
import { getPautasActivas } from "@/app/actions/pautas";
import ChecklistExecution from "../../components/ChecklistExecution";
import ExecutionSignatures from "./ExecutionSignatures";
import CompleteMaintenanceButton from "./CompleteMaintenanceButton";
import CambiarPautaButton from "../../components/CambiarPautaButton";
import { EstadoMantencion } from "@prisma/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EjecutarMantencionPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const [mantencion, pautasActivas] = await Promise.all([
    getMantencionCompleta(id),
    getPautasActivas(),
  ]);

  if (!mantencion) {
    notFound();
  }

  // Si ya está completada, redirigir al detalle
  if (mantencion.estadoMantencion === EstadoMantencion.COMPLETADA) {
    redirect(`/mantenciones/${id}`);
  }

  // Si está cancelada, mostrar mensaje
  if (mantencion.estadoMantencion === EstadoMantencion.CANCELADA) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
            Mantención Cancelada
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-4">
            Esta mantención ha sido cancelada y no puede ser ejecutada.
          </p>
          <Link
            href="/mantenciones/pendientes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Volver a Pendientes
          </Link>
        </div>
      </div>
    );
  }

  // Verificar firmas
  const signatureStatus = await hasRequiredSignatures(id);

  // Preparar datos para el checklist
  const pautaItems = mantencion.pauta?.items || [];
  const responses = mantencion.respuestas || [];

  // Calcular progreso
  const completedItems = responses.filter((r) => r.isCompleted).length;
  const totalItems = pautaItems.length;
  const progress =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const requiredItems = pautaItems.filter((i) => i.isRequired);
  const completedRequired = requiredItems.filter(
    (item) => responses.find((r) => r.pautaItemId === item.id)?.isCompleted
  ).length;
  const allRequiredCompleted = completedRequired === requiredItems.length;

  // Determinar si se puede completar
  const canComplete =
    allRequiredCompleted &&
    signatureStatus.hasTecnico &&
    signatureStatus.hasResponsable;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/mantenciones/pendientes"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Ejecutar Mantención
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Completa el checklist y firma para finalizar
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              mantencion.estadoMantencion === EstadoMantencion.EN_PROCESO
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
            }`}
          >
            {mantencion.estadoMantencion === EstadoMantencion.EN_PROCESO
              ? "En Proceso"
              : "Pendiente"}
          </span>
        </div>
      </div>

      {/* Info del equipo y mantención */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {mantencion.equipo?.modelo || "Sin equipo"} -{" "}
                {mantencion.equipo?.serie || ""}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {mantencion.equipo?.tipoEquipo?.subcategoria ||
                  "Tipo no especificado"}{" "}
                •{" "}
                {mantencion.equipo?.ubicacion
                  ? `${mantencion.equipo.ubicacion.area} - ${mantencion.equipo.ubicacion.establecimiento}`
                  : "Sin ubicación"}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-200 dark:divide-zinc-700">
          <div className="p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium mb-1">
              Fecha Programada
            </p>
            <p className="font-semibold text-zinc-900 dark:text-white">
              {new Date(mantencion.fecha).toLocaleDateString("es-CL", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium mb-1">
              Tipo
            </p>
            <p className="font-semibold text-zinc-900 dark:text-white">
              {mantencion.tipoMantencion}
            </p>
          </div>
          <div className="p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium mb-1">
              Pauta
            </p>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-zinc-900 dark:text-white truncate flex-1">
                {mantencion.pauta?.nombre || "Sin pauta"}
              </p>
              <CambiarPautaButton
                mantencionId={id}
                pautaActualId={mantencion.pauta?.id}
                pautaActualNombre={mantencion.pauta?.nombre}
                pautas={pautasActivas.map((p) => ({
                  id: p.id,
                  codigo: p.codigo,
                  nombre: p.nombre,
                  _count: { items: p.items?.length || 0 },
                }))}
                variant="link"
              />
            </div>
          </div>
          <div className="p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium mb-1">
              Progreso
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checklist - Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Checklist de la pauta */}
          {mantencion.pauta && pautaItems.length > 0 ? (
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
              <ChecklistExecution
                mantencionId={id}
                pautaItems={pautaItems}
                responses={responses}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-amber-600 dark:text-amber-400"
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
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                Sin pauta asignada
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                Esta mantención no tiene una pauta de verificación asignada.
                Puede proceder directamente a las firmas.
              </p>
            </div>
          )}

          {/* Observaciones */}
          {mantencion.observaciones && (
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">
                Observaciones
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">
                {mantencion.observaciones}
              </p>
            </div>
          )}
        </div>

        {/* Panel lateral - Firmas y acciones */}
        <div className="space-y-6">
          {/* Estado de requisitos */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
              Estado de Completitud
            </h3>
            <div className="space-y-3">
              {/* Checklist */}
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-full ${
                    allRequiredCompleted
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-zinc-100 dark:bg-zinc-700"
                  }`}
                >
                  {allRequiredCompleted ? (
                    <svg
                      className="w-4 h-4 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-zinc-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    allRequiredCompleted
                      ? "text-green-700 dark:text-green-300"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  Checklist obligatorio ({completedRequired}/
                  {requiredItems.length})
                </span>
              </div>

              {/* Firma Técnico */}
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-full ${
                    signatureStatus.hasTecnico
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-zinc-100 dark:bg-zinc-700"
                  }`}
                >
                  {signatureStatus.hasTecnico ? (
                    <svg
                      className="w-4 h-4 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-zinc-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    signatureStatus.hasTecnico
                      ? "text-green-700 dark:text-green-300"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  Firma del Técnico
                </span>
              </div>

              {/* Firma Responsable */}
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-full ${
                    signatureStatus.hasResponsable
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-zinc-100 dark:bg-zinc-700"
                  }`}
                >
                  {signatureStatus.hasResponsable ? (
                    <svg
                      className="w-4 h-4 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-zinc-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    signatureStatus.hasResponsable
                      ? "text-green-700 dark:text-green-300"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  Firma del Responsable
                </span>
              </div>
            </div>
          </div>

          {/* Sección de Firmas */}
          <ExecutionSignatures
            mantencionId={id}
            hasTecnico={signatureStatus.hasTecnico}
            hasResponsable={signatureStatus.hasResponsable}
            firmas={mantencion.firmas}
          />

          {/* Botón de completar */}
          <CompleteMaintenanceButton
            mantencionId={id}
            canComplete={canComplete}
            allRequiredCompleted={allRequiredCompleted}
            hasTecnico={signatureStatus.hasTecnico}
            hasResponsable={signatureStatus.hasResponsable}
          />
        </div>
      </div>
    </div>
  );
}

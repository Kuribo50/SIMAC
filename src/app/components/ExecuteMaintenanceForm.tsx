"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createMantencionConChecklist,
  updateMultipleChecklistResponses,
  finalizarMantencion,
} from "../actions/mantenciones";
import { createSignature } from "../actions/firmas";
import { EstadoEquipo, TipoMantencion, RolFirma } from "@prisma/client";
import SignaturePad from "./SignaturePad";

interface PautaItem {
  id: string;
  order: number;
  description: string;
  isRequired: boolean;
}

interface Pauta {
  id: string;
  codigo: string;
  nombre: string;
  items: PautaItem[];
}

interface Equipo {
  id: string;
  nombre: string;
  modelo?: string | null;
  serie?: string | null;
  marca?: string | null;
  inventario?: string | null;
  ubicacion: {
    establecimiento: string;
    area: string;
  };
}

interface ExecuteMaintenanceFormProps {
  equipo: Equipo;
  pautas: Pauta[];
  preselectedPautaId?: string;
}

export default function ExecuteMaintenanceForm({
  equipo,
  pautas,
  preselectedPautaId,
}: ExecuteMaintenanceFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<"config" | "checklist" | "finish">("config");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mantencionId, setMantencionId] = useState<string | null>(null);

  // Estado para firmas
  const [showSignaturePad, setShowSignaturePad] = useState<RolFirma | null>(
    null
  );
  const [firmaTecnico, setFirmaTecnico] = useState<string | null>(null);
  const [firmaResponsable, setFirmaResponsable] = useState<string | null>(null);
  const [nombreTecnico, setNombreTecnico] = useState<string>("");
  const [nombreResponsable, setNombreResponsable] = useState<string>("");
  const [cargoTecnico, setCargoTecnico] = useState<string>("");
  const [cargoResponsable, setCargoResponsable] = useState<string>("");

  // Config state
  const [config, setConfig] = useState<{
    pautaId: string;
    fecha: string;
    tipoMantencion: TipoMantencion;
    equiposDePrueba: string;
    observaciones: string;
  }>({
    pautaId: preselectedPautaId || "",
    fecha: new Date().toISOString().split("T")[0],
    tipoMantencion: TipoMantencion.PREVENTIVO,
    equiposDePrueba: "",
    observaciones: "",
  });

  // Checklist state
  const [responses, setResponses] = useState<
    Record<string, { isCompleted: boolean; comment: string }>
  >({});

  const selectedPauta = pautas.find((p) => p.id === config.pautaId);

  // Iniciar mantención
  const handleStartMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.pautaId) {
      setError("Debe seleccionar una pauta");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const mantencion = await createMantencionConChecklist({
        fecha: new Date(config.fecha),
        equipoId: equipo.id,
        pautaId: config.pautaId,
        tipoMantencion: config.tipoMantencion,
        equiposDePrueba: config.equiposDePrueba || undefined,
        observaciones: config.observaciones || undefined,
      });

      setMantencionId(mantencion.id);

      // Inicializar responses
      const initialResponses: Record<
        string,
        { isCompleted: boolean; comment: string }
      > = {};
      selectedPauta?.items.forEach((item) => {
        initialResponses[item.id] = { isCompleted: false, comment: "" };
      });
      setResponses(initialResponses);

      setStep("checklist");
    } catch (err) {
      setError("Error al crear la mantención");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guardar checklist y continuar
  const handleSaveChecklist = async () => {
    if (!mantencionId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const responseArray = Object.entries(responses).map(
        ([pautaItemId, data]) => ({
          pautaItemId,
          isCompleted: data.isCompleted,
          comment: data.comment || undefined,
        })
      );

      await updateMultipleChecklistResponses(mantencionId, responseArray);
      setStep("finish");
    } catch (err) {
      setError("Error al guardar el checklist");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Finalizar mantención
  const handleFinish = async (estadoResultante: EstadoEquipo) => {
    if (!mantencionId) return;

    // Validar firma del técnico
    if (!firmaTecnico || !nombreTecnico.trim()) {
      setError("La firma y nombre del técnico son obligatorios");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Guardar firma del técnico
      await createSignature({
        mantencionId,
        role: RolFirma.TECNICO,
        nombreFirmante: nombreTecnico,
        cargoFirmante: cargoTecnico || undefined,
        firmaImagen: firmaTecnico,
      });

      // Guardar firma del responsable si existe
      if (firmaResponsable && nombreResponsable.trim()) {
        await createSignature({
          mantencionId,
          role: RolFirma.RESPONSABLE,
          nombreFirmante: nombreResponsable,
          cargoFirmante: cargoResponsable || undefined,
          firmaImagen: firmaResponsable,
        });
      }

      // Finalizar la mantención
      await finalizarMantencion(mantencionId, {
        estadoResultante,
        observaciones: config.observaciones || undefined,
      });

      router.push(`/mantenciones/${mantencionId}`);
    } catch (err) {
      setError("Error al finalizar la mantención");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar captura de firma
  const handleSaveSignature = (signatureData: string) => {
    if (showSignaturePad === RolFirma.TECNICO) {
      setFirmaTecnico(signatureData);
    } else if (showSignaturePad === RolFirma.RESPONSABLE) {
      setFirmaResponsable(signatureData);
    }
    setShowSignaturePad(null);
  };

  // Limpiar firma
  const clearSignature = (role: RolFirma) => {
    if (role === RolFirma.TECNICO) {
      setFirmaTecnico(null);
    } else if (role === RolFirma.RESPONSABLE) {
      setFirmaResponsable(null);
    }
  };

  // Validar si puede finalizar
  const canSubmitFinish = firmaTecnico !== null && nombreTecnico.trim() !== "";

  // Toggle item
  const toggleItem = (itemId: string) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        isCompleted: !prev[itemId]?.isCompleted,
      },
    }));
  };

  // Update comment
  const updateComment = (itemId: string, comment: string) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        comment,
      },
    }));
  };

  // Calcular progreso
  const calculateProgress = () => {
    if (!selectedPauta)
      return { completed: 0, total: 0, required: 0, requiredCompleted: 0 };

    const total = selectedPauta.items.length;
    const completed = Object.values(responses).filter(
      (r) => r.isCompleted
    ).length;
    const requiredItems = selectedPauta.items.filter((i) => i.isRequired);
    const requiredCompleted = requiredItems.filter(
      (i) => responses[i.id]?.isCompleted
    ).length;

    return {
      completed,
      total,
      required: requiredItems.length,
      requiredCompleted,
    };
  };

  const progress = calculateProgress();
  const canFinish = progress.requiredCompleted === progress.required;

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Paso 1: Configuración */}
      {step === "config" && (
        <form
          onSubmit={handleStartMaintenance}
          className="bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-semibold text-zinc-900 mb-6">
            Configurar Mantención
          </h2>

          {/* Info del equipo */}
          <div className="mb-6 p-4 bg-zinc-50 rounded-lg">
            <h3 className="font-medium text-zinc-900">{equipo.nombre}</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-zinc-600">
              <div>
                Ubicación: {equipo.ubicacion.establecimiento} -{" "}
                {equipo.ubicacion.area}
              </div>
              {equipo.modelo && <div>Modelo: {equipo.modelo}</div>}
              {equipo.marca && <div>Marca: {equipo.marca}</div>}
              {equipo.serie && <div>Serie: {equipo.serie}</div>}
              {equipo.inventario && <div>Inventario: {equipo.inventario}</div>}
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Pauta de Mantención *
              </label>
              <select
                value={config.pautaId}
                onChange={(e) =>
                  setConfig({ ...config, pautaId: e.target.value })
                }
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
                required
              >
                <option value="">Seleccione una pauta</option>
                {pautas.map((pauta) => (
                  <option key={pauta.id} value={pauta.id}>
                    {pauta.codigo} - {pauta.nombre} ({pauta.items.length} items)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Fecha de Mantención
                </label>
                <input
                  type="date"
                  value={config.fecha}
                  onChange={(e) =>
                    setConfig({ ...config, fecha: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Tipo de Mantención
                </label>
                <select
                  value={config.tipoMantencion}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      tipoMantencion: e.target.value as TipoMantencion,
                    })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
                >
                  <option value={TipoMantencion.PREVENTIVO}>Preventivo</option>
                  <option value={TipoMantencion.CORRECTIVO}>Correctivo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Equipos de Prueba
              </label>
              <input
                type="text"
                value={config.equiposDePrueba}
                onChange={(e) =>
                  setConfig({ ...config, equiposDePrueba: e.target.value })
                }
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
                placeholder="Ej: Tester, Manómetro, Multímetro"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-zinc-600 hover:text-zinc-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !config.pautaId}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Iniciando..." : "Iniciar Mantención"}
            </button>
          </div>
        </form>
      )}

      {/* Paso 2: Checklist */}
      {step === "checklist" && selectedPauta && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-zinc-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">
                  {selectedPauta.nombre}
                </h2>
                <p className="text-sm text-zinc-600">
                  Complete el checklist de actividades
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-zinc-900">
                  {progress.completed}/{progress.total}
                </div>
                <div className="text-sm text-zinc-500">completados</div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-4 w-full bg-zinc-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(progress.completed / progress.total) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="divide-y divide-zinc-200">
            {selectedPauta.items.map((item) => (
              <div
                key={item.id}
                className={`p-4 flex items-start gap-4 hover:bg-zinc-50 ${
                  responses[item.id]?.isCompleted ? "bg-green-50" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${
                    responses[item.id]?.isCompleted
                      ? "bg-green-600 border-green-600 text-white"
                      : "border-zinc-300 hover:border-green-500"
                  }`}
                >
                  {responses[item.id]?.isCompleted && (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-500">
                      {item.order}.
                    </span>
                    <span className="text-sm text-zinc-900">
                      {item.description}
                    </span>
                    {item.isRequired && (
                      <span className="text-xs text-red-600">*</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={responses[item.id]?.comment || ""}
                    onChange={(e) => updateComment(item.id, e.target.value)}
                    placeholder="Agregar comentario..."
                    className="mt-2 w-full text-sm px-3 py-1 border border-zinc-200 rounded bg-white text-zinc-900 placeholder-zinc-400"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-zinc-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-zinc-600">
                {progress.requiredCompleted}/{progress.required} obligatorios
                completados
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("config")}
                  className="px-4 py-2 text-zinc-600"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={handleSaveChecklist}
                  disabled={isSubmitting || !canFinish}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Continuar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paso 3: Finalizar */}
      {step === "finish" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-6">
            Finalizar Mantención
          </h2>

          {/* Observaciones */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Observaciones Finales
            </label>
            <textarea
              value={config.observaciones}
              onChange={(e) =>
                setConfig({ ...config, observaciones: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900"
              placeholder="Ingrese observaciones adicionales..."
            />
          </div>

          {/* Sección de Firmas */}
          <div className="mb-6 p-4 bg-zinc-50 rounded-lg">
            <h3 className="text-lg font-medium text-zinc-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Firmas de Conformidad
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Firma del Técnico */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700">
                    Técnico <span className="text-red-500">*</span>
                  </span>
                  {firmaTecnico && (
                    <button
                      type="button"
                      onClick={() => clearSignature(RolFirma.TECNICO)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Eliminar firma
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={nombreTecnico}
                  onChange={(e) => setNombreTecnico(e.target.value)}
                  placeholder="Nombre completo del técnico"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 text-sm"
                  required
                />

                <input
                  type="text"
                  value={cargoTecnico}
                  onChange={(e) => setCargoTecnico(e.target.value)}
                  placeholder="Cargo (opcional)"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 text-sm"
                />

                {firmaTecnico ? (
                  <div className="border-2 border-green-500 rounded-lg p-2 bg-white">
                    <img
                      src={firmaTecnico}
                      alt="Firma del técnico"
                      className="w-full h-24 object-contain"
                    />
                    <p className="text-xs text-green-600 text-center mt-1">
                      ✓ Firma capturada
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSignaturePad(RolFirma.TECNICO)}
                    className="w-full p-4 border-2 border-dashed border-zinc-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <svg
                        className="w-8 h-8 mx-auto text-zinc-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      <span className="text-sm text-zinc-600">
                        Capturar firma
                      </span>
                    </div>
                  </button>
                )}
              </div>

              {/* Firma del Responsable (Opcional) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700">
                    Responsable del Área{" "}
                    <span className="text-zinc-400">(opcional)</span>
                  </span>
                  {firmaResponsable && (
                    <button
                      type="button"
                      onClick={() => clearSignature(RolFirma.RESPONSABLE)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Eliminar firma
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={nombreResponsable}
                  onChange={(e) => setNombreResponsable(e.target.value)}
                  placeholder="Nombre del responsable"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 text-sm"
                />

                <input
                  type="text"
                  value={cargoResponsable}
                  onChange={(e) => setCargoResponsable(e.target.value)}
                  placeholder="Cargo (opcional)"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 text-sm"
                />

                {firmaResponsable ? (
                  <div className="border-2 border-green-500 rounded-lg p-2 bg-white">
                    <img
                      src={firmaResponsable}
                      alt="Firma del responsable"
                      className="w-full h-24 object-contain"
                    />
                    <p className="text-xs text-green-600 text-center mt-1">
                      ✓ Firma capturada
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSignaturePad(RolFirma.RESPONSABLE)}
                    className="w-full p-4 border-2 border-dashed border-zinc-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <svg
                        className="w-8 h-8 mx-auto text-zinc-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      <span className="text-sm text-zinc-600">
                        Capturar firma
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Estado Final del Equipo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 mb-3">
              Estado Final del Equipo
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleFinish(EstadoEquipo.OPERATIVO)}
                disabled={isSubmitting || !canSubmitFinish}
                className="p-4 border-2 border-green-500 rounded-lg text-center hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div className="text-3xl mb-2">✅</div>
                <div className="font-medium text-green-700">OPERATIVO</div>
                <div className="text-xs text-zinc-500">
                  Equipo funcionando correctamente
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleFinish(EstadoEquipo.NO_OPERATIVO)}
                disabled={isSubmitting || !canSubmitFinish}
                className="p-4 border-2 border-red-500 rounded-lg text-center hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div className="text-3xl mb-2">❌</div>
                <div className="font-medium text-red-700">NO OPERATIVO</div>
                <div className="text-xs text-zinc-500">Requiere reparación</div>
              </button>
            </div>

            {!canSubmitFinish && (
              <p className="mt-3 text-sm text-amber-600 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Complete el nombre y firma del técnico para finalizar
              </p>
            )}
          </div>

          {/* Botón Volver */}
          <div className="flex justify-start border-t border-zinc-200 pt-4">
            <button
              type="button"
              onClick={() => setStep("checklist")}
              className="px-4 py-2 text-zinc-600 hover:text-zinc-900 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver al checklist
            </button>
          </div>

          {isSubmitting && (
            <div className="text-center text-zinc-600 mt-4">
              <svg
                className="animate-spin h-6 w-6 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Finalizando mantención...
            </div>
          )}
        </div>
      )}

      {/* Modal de Firma */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg">
            <SignaturePad
              title={
                showSignaturePad === RolFirma.TECNICO
                  ? "Firma del Técnico"
                  : "Firma del Responsable"
              }
              onSave={handleSaveSignature}
              onCancel={() => setShowSignaturePad(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

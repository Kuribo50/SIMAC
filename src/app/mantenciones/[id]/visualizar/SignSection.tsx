"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import InstitutionalSeal from "../../components/InstitutionalSeal";

interface Firma {
  id: string;
  role: string;
  nombreFirmante: string;
  rutFirmante: string | null;
  cargoFirmante: string | null;
  firmaImagen: string | null;
  firmadoEn: Date;
}

interface SignSectionProps {
  mantencionId: string;
  firmas: Firma[];
  estadoMantencion: string;
  establecimiento: string;
  checklistCompletados: number;
  totalItems: number;
  checklistResponses: Record<string, boolean>;
  observaciones: string;
}

export default function SignSection({
  mantencionId,
  firmas: initialFirmas,
  estadoMantencion: initialEstado,
  establecimiento,
  checklistCompletados,
  totalItems,
  observaciones,
  checklistResponses,
}: SignSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showSignModal, setShowSignModal] = useState(false);
  const [signingRole, setSigningRole] = useState<
    "TECNICO" | "RESPONSABLE" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingFirma, setEditingFirma] = useState<Firma | null>(null);
  const [signatureData, setSignatureData] = useState<string>("");

  // Estado local para actualización optimista
  const [localFirmas, setLocalFirmas] = useState<Firma[]>(initialFirmas);
  const [localEstado, setLocalEstado] = useState(initialEstado);

  // Sincronizar con props cuando cambien
  useEffect(() => {
    setLocalFirmas(initialFirmas);
    setLocalEstado(initialEstado);
  }, [initialFirmas, initialEstado]);

  const firmaTecnico = localFirmas.find((f) => f.role === "TECNICO");
  const firmaResponsable = localFirmas.find((f) => f.role === "RESPONSABLE");

  const isCompleted = localEstado === "COMPLETADA";
  const hasMinimumChecklist = checklistCompletados >= 1;
  const canComplete =
    firmaTecnico && firmaResponsable && !isCompleted && hasMinimumChecklist;

  const handleSign = (role: "TECNICO" | "RESPONSABLE") => {
    setSigningRole(role);
    setEditingFirma(null);
    setSignatureData("");

    setShowSignModal(true);
  };

  const handleEditFirma = (firma: Firma) => {
    if (isCompleted) return;
    setEditingFirma(firma);
    setSigningRole(firma.role as "TECNICO" | "RESPONSABLE");
    setSignatureData(firma.firmaImagen || "");
    setShowSignModal(true);
  };

  const handleDeleteFirma = async (firmaId: string) => {
    if (isCompleted) return;
    if (!confirm("¿Está seguro de eliminar esta firma?")) return;

    // Guardar estado anterior para rollback
    const previousFirmas = [...localFirmas];
    const previousEstado = localEstado;

    // Actualización optimista inmediata
    const firmaToDelete = localFirmas.find((f) => f.id === firmaId);
    setLocalFirmas((prev) => prev.filter((f) => f.id !== firmaId));

    // Si no quedan firmas, volver a PENDIENTE
    if (localFirmas.length <= 1) {
      setLocalEstado("PENDIENTE");
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/mantenciones/firmar?firmaId=${firmaId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        // Refrescar en segundo plano
        startTransition(() => {
          router.refresh();
        });
      } else {
        // Rollback si falla
        setLocalFirmas(previousFirmas);
        setLocalEstado(previousEstado);
      }
    } catch (error) {
      console.error("Error al eliminar firma:", error);
      // Rollback en caso de error
      setLocalFirmas(previousFirmas);
      setLocalEstado(previousEstado);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignatureSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const firmaValue = formData.get("firmaImagen");
      const firmaImagenFromForm =
        typeof firmaValue === "string" ? firmaValue : null;
      const firmaImagen = signatureData || firmaImagenFromForm;

      if (!firmaImagen || !firmaImagen.trim()) {
        alert("Por favor dibuja tu firma antes de confirmar.");
        setIsSubmitting(false);
        return;
      }

      const nombreFirmante = formData.get("nombre") as string;
      const rutFirmante = formData.get("rut") as string;
      const cargoFirmante = formData.get("cargo") as string;

      const body: any = {
        mantencionId,
        role: signingRole,
        nombreFirmante,
        rutFirmante,
        cargoFirmante,
        firmaImagen,
      };

      // Si es edición, incluir el ID de la firma
      if (editingFirma) {
        body.firmaId = editingFirma.id;
      }

      // Primero enviar al servidor
      const response = await fetch("/api/mantenciones/firmar", {
        method: editingFirma ? "PUT" : "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.error || "No se pudo guardar la firma.");
        setIsSubmitting(false);
        return;
      }

      // Solo si es exitoso, crear firma para UI y cerrar modal
      const responseData = await response.json().catch(() => ({}));

      const newFirma: Firma = {
        id: responseData.firma?.id || `temp-${Date.now()}`,
        role: signingRole!,
        nombreFirmante,
        rutFirmante: rutFirmante || null,
        cargoFirmante: cargoFirmante || null,
        firmaImagen,
        firmadoEn: new Date(),
      };

      // Actualizar estado local inmediatamente
      if (editingFirma) {
        setLocalFirmas((prev) =>
          prev.map((f) => (f.id === editingFirma.id ? newFirma : f))
        );
      } else {
        setLocalFirmas((prev) => [...prev, newFirma]);
      }
      setLocalEstado("EN_PROCESO");

      // Cerrar modal
      setShowSignModal(false);
      setEditingFirma(null);
      setSignatureData("");
      setIsSubmitting(false);

      // Refrescar en segundo plano para sincronizar con servidor
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Error al firmar:", error);
      alert("Ocurrió un error al guardar la firma. Intenta nuevamente.");
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    // Validación extra en frontend
    if (checklistCompletados < 1) {
      alert(
        "Debe completar al menos 1 item del checklist antes de finalizar la mantención"
      );
      return;
    }

    // Actualización optimista
    const previousEstado = localEstado;
    setLocalEstado("COMPLETADA");

    setIsCompleting(true);
    try {
      const response = await fetch("/api/mantenciones/completar", {
        method: "POST",
        body: JSON.stringify({
          mantencionId,
          observaciones,
          checklistResponses,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // Refrescar en segundo plano
        startTransition(() => {
          router.refresh();
        });
      } else {
        // Rollback si falla y mostrar error
        const errorData = await response.json().catch(() => null);
        alert(errorData?.error || "No se pudo completar la mantención");
        setLocalEstado(previousEstado);
      }
    } catch (error) {
      console.error("Error al completar:", error);
      alert("Ocurrió un error al completar la mantención");
      // Rollback en caso de error
      setLocalEstado(previousEstado);
    } finally {
      setIsCompleting(false);
    }
  };

  const renderFirmaContent = (
    firma: Firma | undefined,
    role: "TECNICO" | "RESPONSABLE"
  ) => {
    if (firma) {
      return (
        <div className="text-center relative group">
          {firma.firmaImagen && (
            <motion.img
              initial={{ opacity: 0, scale: 2, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
                mass: 1,
              }}
              src={firma.firmaImagen}
              alt={`Firma ${role}`}
              className="max-h-20 mx-auto mb-2"
            />
          )}
          <p className="font-bold text-blue-900 dark:text-blue-300 text-sm uppercase">
            {firma.nombreFirmante}
          </p>
          {firma.cargoFirmante && (
            <p className="text-xs text-gray-700 dark:text-slate-300 font-medium">
              {firma.cargoFirmante}
            </p>
          )}
          {firma.rutFirmante && (
            <p className="text-xs text-gray-600 dark:text-slate-400">
              RUT: {firma.rutFirmante}
            </p>
          )}

          {/* Botones de editar/eliminar - Solo si no está completada */}
          {!isCompleted && (
            <div className="absolute top-0 right-0 flex gap-1 z-20 print:hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditFirma(firma);
                }}
                className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                title="Editar firma"
              >
                <svg
                  className="w-4 h-4"
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
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFirma(firma.id);
                }}
                disabled={isDeleting}
                className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                title="Eliminar firma"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      );
    }

    // Botón para firmar - Solo si no está completada
    if (!isCompleted) {
      return (
        <button
          onClick={() => handleSign(role)}
          className={`px-4 py-2 ${
            role === "TECNICO"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-600 hover:bg-green-700"
          } text-white rounded-lg print:hidden`}
        >
          Firmar como {role === "TECNICO" ? "Técnico" : "Responsable"}
        </button>
      );
    }

    // Si está completada y no hay firma
    return (
      <span className="text-gray-400 dark:text-slate-500 italic">
        Sin firma
      </span>
    );
  };

  return (
    <>
      {/* Signatures Area */}
      <div className="grid grid-cols-2 gap-4 mt-3 items-stretch print:break-inside-avoid">
        {/* Técnico Signature */}
        <div className="text-center">
          <div className="border-2 border-black dark:border-slate-700 p-2 min-h-48 flex flex-row items-center gap-2 relative bg-white dark:bg-slate-900">
            {/* Left: Stamp */}
            <div className="shrink-0 flex items-center justify-center w-1/3 border-r-2 border-dashed border-gray-300 dark:border-slate-700 h-full bg-slate-50/50 dark:bg-slate-800/50">
              <div className="transform -rotate-45 opacity-90 scale-110">
                <InstitutionalSeal
                  size={100}
                  role="TÉCNICO MANTENCIÓN"
                  establecimiento="CESFAM ALBERTO REYES"
                />
              </div>
            </div>

            {/* Right: Signature Content */}
            <div className="flex-1 flex flex-col justify-between h-full relative z-10 pt-2">
              <div className="flex-1 flex items-center justify-center">
                {renderFirmaContent(firmaTecnico, "TECNICO")}
              </div>
              <div className="w-full">
                <div className="border-t border-black dark:border-slate-700 mt-1 mb-1 mx-4"></div>
                <p className="font-bold text-xs uppercase text-gray-800 dark:text-slate-200">
                  Técnico Responsable
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Responsable Signature */}
        <div className="text-center">
          <div className="border-2 border-black dark:border-slate-700 p-2 min-h-48 flex flex-row items-center gap-2 relative bg-white dark:bg-slate-900">
            {/* Left: Stamp */}
            <div className="shrink-0 flex items-center justify-center w-1/3 border-r-2 border-dashed border-gray-300 dark:border-slate-700 h-full bg-slate-50/50 dark:bg-slate-800/50">
              <div className="transform -rotate-45 opacity-90 scale-110">
                <InstitutionalSeal
                  size={100}
                  role="JEFE ÁREA ADMIN."
                  establecimiento="CESFAM ALBERTO REYES"
                />
              </div>
            </div>

            {/* Signature Content */}
            <div className="flex-1 flex flex-col justify-between h-full relative z-10 pt-2">
              <div className="flex-1 flex items-center justify-center">
                {renderFirmaContent(firmaResponsable, "RESPONSABLE")}
              </div>
              <div className="w-full">
                <div className="border-t border-black dark:border-slate-700 mt-1 mb-1 mx-4"></div>
                <p className="font-bold text-xs uppercase text-gray-800 dark:text-slate-200">
                  Responsable Institucional
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Button - Solo si no está completada y tiene ambas firmas y al menos 1 item */}
      {canComplete && (
        <div className="mt-3 text-center print:hidden">
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm disabled:opacity-50"
          >
            {isCompleting
              ? "Completando..."
              : "✓ Marcar Mantención como Completada"}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Una vez completada, no se podrán realizar más cambios
          </p>
        </div>
      )}

      {/* Mensaje de requisitos faltantes */}
      {!isCompleted && !canComplete && (firmaTecnico || firmaResponsable) && (
        <div className="mt-3 text-center print:hidden">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <svg
              className="w-5 h-5 text-amber-600"
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
            <div className="text-left">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Requisitos para completar:
              </p>
              <ul className="text-xs text-amber-700 dark:text-amber-300 mt-1 space-y-0.5">
                {!firmaTecnico && <li>• Falta firma del Técnico</li>}
                {!firmaResponsable && <li>• Falta firma del Responsable</li>}
                {!hasMinimumChecklist && (
                  <li>
                    • Debe completar al menos 1 item del checklist (
                    {checklistCompletados}/{totalItems})
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold mb-4 dark:text-slate-100">
              {editingFirma ? "Editar" : "Firmar como"}{" "}
              {signingRole === "TECNICO"
                ? "Técnico"
                : "Responsable Institucional"}
            </h3>

            <form action={handleSignatureSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  defaultValue={editingFirma?.nombreFirmante || ""}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Ingrese su nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  RUT
                </label>
                <input
                  type="text"
                  name="rut"
                  defaultValue={editingFirma?.rutFirmante || ""}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-slate-100"
                  placeholder="12.345.678-9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Cargo
                </label>
                <input
                  type="text"
                  name="cargo"
                  defaultValue={
                    editingFirma?.cargoFirmante ||
                    (signingRole === "TECNICO" ? "Técnico de Mantención" : "")
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-slate-100"
                  placeholder={
                    signingRole === "TECNICO"
                      ? "Técnico de Mantención"
                      : "Jefe Área Administrativa"
                  }
                />
              </div>

              <SignatureCanvas
                key={editingFirma?.id ?? signingRole ?? "new"}
                defaultImage={editingFirma?.firmaImagen}
                onChange={setSignatureData}
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSignModal(false);
                    setEditingFirma(null);
                    setSignatureData("");
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Guardando..."
                    : editingFirma
                    ? "Actualizar"
                    : "Confirmar Firma"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Signature Canvas Component
function SignatureCanvas({
  defaultImage,
  onChange,
  onNameChange, // To auto-fill signature when typing name? Optional.
}: {
  defaultImage?: string | null;
  onChange: (value: string) => void;
  onNameChange?: (name: string) => void;
}) {
  const [mode, setMode] = useState<"draw" | "type" | "upload" | "biometric">(
    "type"
  ); // Added upload mode
  const [typedName, setTypedName] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Base64 Placeholder for Fingerprint Image (SVG)
  const FINGERPRINT_SVG =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMWUzYTVmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEyIDEwYTIgMiAwIDAgMCAtMiAydjJhMiAyIDAgMCAwIDIgMiIvPjxwYXRoIGQ9Ik0xNCAxM2EyIDIgMCAwIDAgMi0ydi0yYTItMiAwIDAgMC00LTAiLz48cGF0aCBkPSJNMTkuNSA5LjVMMTguMzMzIDc5MTguMzMzIDdBNS4wNSA1LjA1IDAgMCAwIDEzLjI1IDRhNS4wNSA1LjA1IDAgMCAwLTUuMDgzIDNMMTkuNSA5LjV6Ii8+PHBhdGgGZGU9Ik0xNiAxNHYyYTRgNCAwIDAgMS04IDB2LTJhMyAzIDAgMCAxIDMtMyIvPjwvc3ZnPg==";
  // A cleaner fingerprint icon path
  // Placeholder for a Realistic Fingerprint (Base64 of a detailed fingerprint image)
  // Using a detailed SVG path that looks closer to a real fingerprint
  const FINGERPRINT_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100" height="100" fill="#1e3a5f">
      <path d="M256 0C163.6 0 85.9 52.3 54.3 129.5c-4.4 10.7 0.7 23 11.4 27.4s23-0.7 27.4-11.4C115.8 80.7 180.7 41.2 256 41.2c74.4 0 138.8 38.8 162.2 103 4.2 11.2 16.5 16.7 27.7 12.5s16.7-16.5 12.5-27.7C425.2 51.5 348.1 0 256 0zm0 82.3c-44.4 0-83.9 22.8-107.5 57.2-6.5 9.5-4 22.4 5.5 28.9s22.4 4 28.9-5.5c14.6-21.3 39-35.4 66.5-35.4 33.2 0 61.6 20.3 73.6 49.3 4.3 10.5 16.3 15.5 26.8 11.2s15.5-16.3 11.2-26.8C341.2 113.8 294.6 82.3 256 82.3zm0 82.3c-15.6 0-30 6.6-40.3 17.1-8.2 8.4-8 21.8 0.4 30s21.8 8 30 0.4c2.6-2.6 6.1-4.2 9.9-4.2 8.7 0 15.8 7.1 15.8 15.8v9.1c-34.1 4.5-62.6 24.3-79.6 52.8-5.3 8.9-10.4 17.5-15.3 25.4-10.4 16.6-20.1 32.1-33.8 45.6-8.5 8.3-8.6 21.9-0.3 30.4 8.3 8.5 21.9 8.6 30.4 0.3 18.2-18 30.1-37 42.4-56.7 4.9-7.9 9.8-16.3 14.9-24.7 10.1-16.9 26.3-29.2 45.5-34V349c0 10 2 19.8 5.7 28.8 5.3 12.8 16.2 21.2 28.8 21.2h4.5c18.5 0 33.5-15 33.5-33.5v-18.7c0-23.4-16.8-43.2-39.1-47.5-3.8-0.7-7.6-1.1-11.5-1.1h-7.6v-25.7c0-31.4-25.5-56.9-56.9-56.9zM256 246.9c-8.7 0-15.8 7.1-15.8 15.8v22.8c12.6 3.6 23.9 10.9 32.5 20.9 1.1-1.3 2.1-2.7 3.1-4.1 5.9-8.5 12.8-16.2 20.8-22.9-9.9-19.3-30.1-32.5-53.5-32.5h-5.4c-8.7 0-15.8-7.1-15.8-15.8 0-8.7 7.1-15.8 15.8-15.8 25.5 0 49.3 8.5 68.3 22.8-2.1 2.3-4.2 4.7-6.2 7.1-14.5 17.6-25.1 38.1-31.2 60 7.5 1.5 14.7 3.9 21.5 7.1 1.9-4.2 4.2-8.3 6.9-12.1 9.9-14.2 24.2-24.8 40.7-29.8v-10.4c0-31.4-25.5-56.9-56.9-56.9z"/>
      <path d="M168.5 351.5c4.7 10.5 16.9 15.2 27.4 10.5 10.5-4.7 15.2-16.9 10.5-27.4-9.5-21.2-14.3-44.3-14.3-68.1 0-11.2 0.8-22.1 2.4-32.8 1.7-11.7-6.4-22.6-18.1-24.3-11.7-1.7-22.6 6.4-24.3 18.1-1.9 12.8-2.9 25.9-2.9 39 0 28.5 5.8 56.1 17.1 81.6 1.1 1.7 1.6 2.5 2.2 3.4zM399.2 196.2c-15.1-45.3-57.8-75.3-105.7-75.3-11.7 0-21.2 9.5-21.2 21.2s9.5 21.2 21.2 21.2c28.5 0 53.6 17.7 62.5 44.1 3.7 11.1 15.7 16.9 26.8 13.2 11.1-3.7 16.9-15.7 13.2-26.8zM449.6 242.4c-11.5-2.6-22.8 4.7-25.4 16.1-4.7 20.9-14.3 40.3-27.9 57.2-7.1 8.9-5.7 22 3.2 29.1 8.9 7.1 22 5.7 29.1-3.2 16.3-20.3 27.8-43.6 33.4-68.6 2.6-11.4-4.8-22.8-16.2-25.4z"/>
    </svg>`;

  // Convert SVG string to Data URL
  const getFingerprintDataUrl = () => {
    const svg = encodeURIComponent(FINGERPRINT_ICON);
    return `data:image/svg+xml;charset=utf-8,${svg}`;
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize or Clear canvas
  const initOrClear = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Reset context properties in case they were changed
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 2;
  };

  const updateHiddenInput = (dataUrl: string) => {
    if (inputRef.current) {
      inputRef.current.value = dataUrl;
      onChange(dataUrl);
    }
  };

  // Effect to handle mode switching
  useEffect(() => {
    // Only clear if we are NOT switching to upload (to keep the canvas clean)
    // OR just always clear for simplicity.
    initOrClear();
    setHasDrawn(false);
    if (inputRef.current) inputRef.current.value = "";
    onChange("");

    if (mode === "type" && typedName) {
      renderTypedSignature(typedName);
    }
    // Upload mode waits for user input
    // Biometric mode waits for user action
  }, [mode]);

  // Handle Biometric Scan
  const handleBiometricScan = () => {
    setIsScanning(true);
    // Simulate API call to DigitalPersona WebSdk
    setTimeout(() => {
      setIsScanning(false);
      setHasDrawn(true);

      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      if (!canvas || !ctx) return;

      // Clear and draw fingerprint
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      img.onload = () => {
        // Center image
        const scale = Math.min(
          (canvas.width / img.width) * 0.8, // 80% size
          (canvas.height / img.height) * 0.8
        );
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // Add text "FIRMADO DIGITALMENTE"
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "#1e3a5f";
        ctx.textAlign = "center";
        ctx.fillText(
          "VALIDACIÓN BIOMÉTRICA",
          canvas.width / 2,
          canvas.height - 10
        );

        updateHiddenInput(canvas.toDataURL("image/png"));
      };
      img.src = getFingerprintDataUrl();
    }, 2000); // 2 second mock delay
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;

        // Clear and draw image centered/scaled
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate scale to fit
        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );
        const x = canvas.width / 2 - (img.width / 2) * scale;
        const y = canvas.height / 2 - (img.height / 2) * scale;

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          x,
          y,
          img.width * scale,
          img.height * scale
        );

        setHasDrawn(true);
        updateHiddenInput(canvas.toDataURL("image/png"));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle Typing
  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setTypedName(name);
    renderTypedSignature(name);
  };

  const renderTypedSignature = (text: string) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!text) {
      setHasDrawn(false);
      updateHiddenInput("");
      return;
    }

    ctx.font = "italic 40px 'Dancing Script', cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#1e3a5f";

    // Draw text in center
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    setHasDrawn(true);
    updateHiddenInput(canvas.toDataURL("image/png"));
  };

  // ... (Keep existing Drawing Logic functions: startDrawing, draw, stopDrawing, getRelativePosition)
  const getRelativePosition = (event: React.MouseEvent | React.TouchEvent) => {
    /* existing implementation */
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width ? canvas.width / rect.width : 1;
    const scaleY = rect.height ? canvas.height / rect.height : 1;

    if ("clientX" in event) {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    }
    const touch = event.touches[0];
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (mode !== "draw") return; // Block drawing in type mode
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getRelativePosition(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || mode !== "draw") return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getRelativePosition(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    ctxRef.current?.closePath();
    if (canvasRef.current) {
      updateHiddenInput(canvasRef.current.toDataURL("image/png"));
    }
  };

  // Initial Setup
  const initCanvas = (el: HTMLCanvasElement | null) => {
    if (el && el !== canvasRef.current) {
      canvasRef.current = el;
      const ctx = el.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#1e3a5f";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctxRef.current = ctx;

        // Load default if provided and we are in draw mode (or just init)
        if (defaultImage && mode === "draw") {
          // Force draw mode if loading old image?
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            setHasDrawn(true);
            updateHiddenInput(defaultImage);
          };
          img.src = defaultImage;
          // Maybe strict mode to draw if default is present?
          // setMode("draw"); // Side effect warning.
        }
      }
    }
  };

  return (
    <div>
      <div className="flex gap-4 mb-3 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setMode("type")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            mode === "type"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Escribir Firma
        </button>
        <button
          type="button"
          onClick={() => setMode("draw")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            mode === "draw"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Dibujar Firma
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            mode === "upload"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Subir Imagen
        </button>
        <button
          type="button"
          onClick={() => setMode("biometric")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${
            mode === "biometric"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Huella Digital
        </button>
      </div>

      {mode === "type" && (
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">
            Escribe tu nombre para generar la firma
          </label>
          <input
            type="text"
            value={typedName}
            onChange={handleTypeChange}
            placeholder="Ej: Juan Pérez"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-cursive text-xl"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          />
        </div>
      )}

      {mode === "biometric" && (
        <div className="mb-4 flex flex-col items-center justify-center py-4 bg-slate-50 rounded-lg border border-slate-200">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 ${
              isScanning
                ? "bg-blue-100 animate-pulse"
                : hasDrawn
                ? "bg-green-100"
                : "bg-gray-200"
            }`}
          >
            {isScanning ? (
              <svg
                className="w-10 h-10 text-blue-600 animate-spin"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className={`w-10 h-10 ${
                  hasDrawn ? "text-green-600" : "text-gray-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.59-4.18M5.5 5.5A16.1 16.1 0 0113.843 3"
                />
              </svg>
            )}
          </div>

          <p className="text-sm font-medium text-gray-700 mb-2">
            {isScanning
              ? "Escaneando dispositivo..."
              : hasDrawn
              ? "Huella capturada exitosamente"
              : "Lector DigitalPersona detectado"}
          </p>

          {!isScanning && !hasDrawn && (
            <button
              type="button"
              onClick={handleBiometricScan}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 shadow-sm"
            >
              Iniciar Captura
            </button>
          )}
        </div>
      )}

      {mode === "upload" && (
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">
            Sube una imagen de tu firma (PNG, JPG)
          </label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className={`block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100`}
          />
        </div>
      )}

      {mode === "draw" && (
        <p className="text-xs text-gray-500 mb-2">
          Usa tu mouse, lápiz digital o dedo para firmar.
        </p>
      )}

      {/* Canvas is always present but maybe hidden/read-only in type mode? 
          Actually we want to show the preview on the canvas too. */}
      <div
        className={`border-2 ${
          mode === "draw" ? "border-dashed" : "border-solid"
        } border-gray-300 rounded-lg p-2 bg-white relative`}
      >
        <canvas
          ref={initCanvas}
          width={400}
          height={150}
          className={`w-full bg-gray-50 rounded ${
            mode === "draw" ? "cursor-crosshair touch-none" : "cursor-default"
          }`}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
        />
        {hasDrawn && (
          <div className="absolute top-2 right-2">
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
              OK
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-2">
        {mode === "draw" && (
          <button
            type="button"
            onClick={() => {
              setHasDrawn(false);
              initOrClear();
              updateHiddenInput("");
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Limpiar
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="hidden"
        name="firmaImagen"
        defaultValue={defaultImage || ""}
      />
      {/* Load font */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap");
      `}</style>
    </div>
  );
}

"use client";

import { useState } from "react";
import SignaturePad from "./SignaturePad";
import { createSignature } from "../actions/firmas";
import { RolFirma } from "@prisma/client";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  mantencionId: string;
  role: RolFirma;
  onSuccess?: () => void;
}

export default function SignatureModal({
  isOpen,
  onClose,
  mantencionId,
  role,
  onSuccess,
}: SignatureModalProps) {
  const [step, setStep] = useState<"info" | "signature">("info");
  const [formData, setFormData] = useState({
    nombreFirmante: "",
    rutFirmante: "",
    cargoFirmante: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleLabels: Record<RolFirma, string> = {
    TECNICO: "Personal Técnico",
    RESPONSABLE: "Responsable Institucional",
    SUPERVISOR: "Supervisor",
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreFirmante.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setError(null);
    setStep("signature");
  };

  const handleSignatureSave = async (signatureData: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await createSignature({
        mantencionId,
        role,
        nombreFirmante: formData.nombreFirmante,
        rutFirmante: formData.rutFirmante || undefined,
        cargoFirmante: formData.cargoFirmante || undefined,
        firmaImagen: signatureData,
        userAgent: navigator.userAgent,
      });

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError("Error al guardar la firma. Intente nuevamente.");
      console.error("Error saving signature:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("info");
    setFormData({ nombreFirmante: "", rutFirmante: "", cargoFirmante: "" });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Firmar como {roleLabels[role]}
            </h2>
            <button
              onClick={handleClose}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {step === "info" ? (
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.nombreFirmante}
                  onChange={(e) =>
                    setFormData({ ...formData, nombreFirmante: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese su nombre completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  RUT (opcional)
                </label>
                <input
                  type="text"
                  value={formData.rutFirmante}
                  onChange={(e) =>
                    setFormData({ ...formData, rutFirmante: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="12.345.678-9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Cargo (opcional)
                </label>
                <input
                  type="text"
                  value={formData.cargoFirmante}
                  onChange={(e) =>
                    setFormData({ ...formData, cargoFirmante: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Técnico en Mantención"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continuar a Firma
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  <strong>Firmante:</strong> {formData.nombreFirmante}
                  {formData.rutFirmante && ` | RUT: ${formData.rutFirmante}`}
                  {formData.cargoFirmante && ` | ${formData.cargoFirmante}`}
                </p>
              </div>

              <SignaturePad
                title={`Firma de ${roleLabels[role]}`}
                onSave={handleSignatureSave}
                onCancel={() => setStep("info")}
              />

              {isSubmitting && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <svg
                      className="animate-spin h-4 w-4"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Guardando firma...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

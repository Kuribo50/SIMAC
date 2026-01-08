"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignatureModal from "@/app/components/SignatureModal";
import { RolFirma } from "@prisma/client";

interface Firma {
  id: string;
  role: RolFirma;
  nombreFirmante: string;
  rutFirmante?: string | null;
  cargoFirmante?: string | null;
  firmadoEn: Date;
  firmaImagen: string;
}

interface ExecutionSignaturesProps {
  mantencionId: string;
  hasTecnico: boolean;
  hasResponsable: boolean;
  firmas: Firma[];
}

export default function ExecutionSignatures({
  mantencionId,
  hasTecnico,
  hasResponsable,
  firmas,
}: ExecutionSignaturesProps) {
  const router = useRouter();
  const [modalRole, setModalRole] = useState<RolFirma | null>(null);

  const firmaTecnico = firmas.find((f) => f.role === RolFirma.TECNICO);
  const firmaResponsable = firmas.find((f) => f.role === RolFirma.RESPONSABLE);

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
      <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
        Firmas Digitales
      </h3>

      <div className="space-y-4">
        {/* Firma Técnico */}
        <div
          className={`rounded-lg border-2 p-4 ${
            hasTecnico
              ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
              : "border-dashed border-zinc-300 dark:border-zinc-600"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-full ${
                  hasTecnico
                    ? "bg-green-100 dark:bg-green-900/40"
                    : "bg-blue-100 dark:bg-blue-900/40"
                }`}
              >
                <svg
                  className={`w-4 h-4 ${
                    hasTecnico
                      ? "text-green-600 dark:text-green-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <span className="font-medium text-zinc-900 dark:text-white">
                Personal Técnico
              </span>
            </div>
            {hasTecnico && (
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full">
                ✓ Firmado
              </span>
            )}
          </div>

          {hasTecnico && firmaTecnico ? (
            <div className="space-y-2">
              <div className="bg-white dark:bg-zinc-700 rounded-lg p-3 border border-green-100 dark:border-green-800">
                {firmaTecnico.firmaImagen && (
                  <img
                    src={firmaTecnico.firmaImagen}
                    alt="Firma del técnico"
                    className="h-16 mx-auto mb-2"
                  />
                )}
                <div className="text-center">
                  <p className="font-medium text-zinc-900 dark:text-white text-sm">
                    {firmaTecnico.nombreFirmante}
                  </p>
                  {firmaTecnico.rutFirmante && (
                    <p className="text-xs text-zinc-500">
                      RUT: {firmaTecnico.rutFirmante}
                    </p>
                  )}
                  {firmaTecnico.cargoFirmante && (
                    <p className="text-xs text-zinc-500">
                      {firmaTecnico.cargoFirmante}
                    </p>
                  )}
                  <p className="text-xs text-zinc-400 mt-1">
                    {new Date(firmaTecnico.firmadoEn).toLocaleString("es-CL")}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setModalRole(RolFirma.TECNICO)}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
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
              Firmar como Técnico
            </button>
          )}
        </div>

        {/* Firma Responsable */}
        <div
          className={`rounded-lg border-2 p-4 ${
            hasResponsable
              ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
              : "border-dashed border-zinc-300 dark:border-zinc-600"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-full ${
                  hasResponsable
                    ? "bg-green-100 dark:bg-green-900/40"
                    : "bg-purple-100 dark:bg-purple-900/40"
                }`}
              >
                <svg
                  className={`w-4 h-4 ${
                    hasResponsable
                      ? "text-green-600 dark:text-green-400"
                      : "text-purple-600 dark:text-purple-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <span className="font-medium text-zinc-900 dark:text-white">
                Responsable Institucional
              </span>
            </div>
            {hasResponsable && (
              <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full">
                ✓ Firmado
              </span>
            )}
          </div>

          {hasResponsable && firmaResponsable ? (
            <div className="space-y-2">
              <div className="bg-white dark:bg-zinc-700 rounded-lg p-3 border border-green-100 dark:border-green-800">
                {firmaResponsable.firmaImagen && (
                  <img
                    src={firmaResponsable.firmaImagen}
                    alt="Firma del responsable"
                    className="h-16 mx-auto mb-2"
                  />
                )}
                <div className="text-center">
                  <p className="font-medium text-zinc-900 dark:text-white text-sm">
                    {firmaResponsable.nombreFirmante}
                  </p>
                  {firmaResponsable.rutFirmante && (
                    <p className="text-xs text-zinc-500">
                      RUT: {firmaResponsable.rutFirmante}
                    </p>
                  )}
                  {firmaResponsable.cargoFirmante && (
                    <p className="text-xs text-zinc-500">
                      {firmaResponsable.cargoFirmante}
                    </p>
                  )}
                  <p className="text-xs text-zinc-400 mt-1">
                    {new Date(firmaResponsable.firmadoEn).toLocaleString(
                      "es-CL"
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setModalRole(RolFirma.RESPONSABLE)}
              className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
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
              Firmar como Responsable
            </button>
          )}
        </div>
      </div>

      {/* Mensaje de estado */}
      {hasTecnico && hasResponsable && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
          <p className="text-green-700 dark:text-green-300 font-medium text-sm">
            ✅ Todas las firmas completadas
          </p>
        </div>
      )}

      {/* Modal de Firma */}
      {modalRole && (
        <SignatureModal
          isOpen={!!modalRole}
          onClose={() => setModalRole(null)}
          mantencionId={mantencionId}
          role={modalRole}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

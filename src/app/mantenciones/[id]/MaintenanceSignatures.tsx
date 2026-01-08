"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignatureModal from "../../components/SignatureModal";
import { RolFirma } from "@prisma/client";

interface MaintenanceSignaturesProps {
  mantencionId: string;
  hasTecnico: boolean;
  hasResponsable: boolean;
}

export default function MaintenanceSignatures({
  mantencionId,
  hasTecnico,
  hasResponsable,
}: MaintenanceSignaturesProps) {
  const router = useRouter();
  const [modalRole, setModalRole] = useState<RolFirma | null>(null);

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
        Firmas Digitales
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Botón Firma Técnico */}
        <button
          onClick={() => setModalRole(RolFirma.TECNICO)}
          disabled={hasTecnico}
          className={`p-4 rounded-lg border-2 text-center transition-colors ${
            hasTecnico
              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
              : "border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 cursor-pointer"
          }`}
        >
          <div className="text-2xl mb-2">{hasTecnico ? "✅" : "✍️"}</div>
          <div className="font-medium text-zinc-900 dark:text-white">
            {hasTecnico ? "Técnico Firmado" : "Firmar como Técnico"}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {hasTecnico ? "Firma registrada" : "Click para firmar"}
          </p>
        </button>

        {/* Botón Firma Responsable */}
        <button
          onClick={() => setModalRole(RolFirma.RESPONSABLE)}
          disabled={hasResponsable}
          className={`p-4 rounded-lg border-2 text-center transition-colors ${
            hasResponsable
              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
              : "border-purple-500 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 cursor-pointer"
          }`}
        >
          <div className="text-2xl mb-2">{hasResponsable ? "✅" : "✍️"}</div>
          <div className="font-medium text-zinc-900 dark:text-white">
            {hasResponsable ? "Responsable Firmado" : "Firmar como Responsable"}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {hasResponsable ? "Firma registrada" : "Click para firmar"}
          </p>
        </button>
      </div>

      {hasTecnico && hasResponsable && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
          <p className="text-green-700 dark:text-green-300 font-medium">
            ✅ Documento completamente firmado
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Puede imprimir o exportar el documento
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

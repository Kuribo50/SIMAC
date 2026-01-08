"use client";

import { useState, useEffect } from "react";
import InteractiveChecklist from "./InteractiveChecklist";
import SignSection from "./SignSection";

interface PautaItem {
  id: string;
  description: string;
  order: number;
}

interface Respuesta {
  id: string;
  pautaItemId: string;
  isCompleted: boolean;
  comment: string | null;
}

interface Firma {
  id: string;
  role: string;
  nombreFirmante: string;
  rutFirmante: string | null;
  cargoFirmante: string | null;
  firmaImagen: string | null;
  firmadoEn: Date;
}

interface ChecklistSignatureWrapperProps {
  mantencionId: string;
  items: PautaItem[];
  respuestas: Respuesta[];
  estadoMantencion: string;
  observaciones: string | null;
  firmas: Firma[];
  establecimiento: string;
  isAdmin?: boolean;
  adminName?: string;
  editedAfterCompletionAt?: Date | null;
  editedAfterCompletionBy?: string | null;
}

export default function ChecklistSignatureWrapper({
  mantencionId,
  items,
  respuestas,
  estadoMantencion,
  observaciones,
  firmas,
  establecimiento,
  isAdmin = false,
  adminName = "",
  editedAfterCompletionAt,
  editedAfterCompletionBy,
}: ChecklistSignatureWrapperProps) {
  // Estado compartido para el conteo de items completados
  const [checklistCompletados, setChecklistCompletados] = useState(() => {
    return respuestas.filter((r) => r.isCompleted).length;
  });

  // Sincronizar cuando cambien las respuestas desde el servidor
  useEffect(() => {
    setChecklistCompletados(respuestas.filter((r) => r.isCompleted).length);
  }, [respuestas]);

  // Callback para actualizar el conteo cuando cambia un check
  const handleChecklistChange = (completedCount: number) => {
    setChecklistCompletados(completedCount);
  };

  // Estado para observaciones
  // Estado local para las checklist responses (lifting state)
  const [checklistResponses, setChecklistResponses] = useState(() => {
    const initial: Record<string, boolean> = {};
    respuestas.forEach((r) => {
      initial[r.pautaItemId] = r.isCompleted;
    });
    return initial;
  });

  const [currentObservaciones, setCurrentObservaciones] = useState(
    observaciones || ""
  );

  // Derivar el contador desde el estado local
  const completedCount =
    Object.values(checklistResponses).filter(Boolean).length;

  return (
    <>
      {/* Interactive Checklist and Observations */}
      <InteractiveChecklist
        mantencionId={mantencionId}
        items={items}
        respuestas={respuestas}
        estadoMantencion={estadoMantencion}
        observaciones={currentObservaciones}
        setObservaciones={setCurrentObservaciones}
        // New props for lifted state
        checklistResponses={checklistResponses}
        onVerifyResponse={(itemId, value) => {
          setChecklistResponses((prev) => ({ ...prev, [itemId]: value }));
        }}
        isAdmin={isAdmin}
        adminName={adminName}
        editedAfterCompletionAt={editedAfterCompletionAt}
        editedAfterCompletionBy={editedAfterCompletionBy}
      />

      {/* Signatures Section */}
      <SignSection
        mantencionId={mantencionId}
        firmas={firmas}
        estadoMantencion={estadoMantencion}
        establecimiento={establecimiento}
        checklistCompletados={completedCount}
        totalItems={items.length}
        observaciones={currentObservaciones}
        checklistResponses={checklistResponses} // Pass the full state for saving
      />
    </>
  );
}

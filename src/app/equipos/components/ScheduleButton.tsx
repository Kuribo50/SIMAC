"use client";

import { useState } from "react";
import ScheduleModal from "../../planificacion/components/ScheduleModal";

interface ScheduleButtonProps {
  equipo: any;
  templates: any[];
}

export default function ScheduleButton({
  equipo,
  templates,
}: ScheduleButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Verificar si el equipo está de baja
  const isDeBaja = equipo.estado === "DE_BAJA";

  return (
    <>
      <button
        onClick={() => !isDeBaja && setIsModalOpen(true)}
        disabled={isDeBaja}
        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm ${
          isDeBaja
            ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
        title={
          isDeBaja
            ? "No se puede programar: equipo dado de baja"
            : "Programar Mantención"
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {isDeBaja ? "No disponible" : "Programar Mantención"}
      </button>

      {!isDeBaja && (
        <ScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDate={new Date()} // Default to today
          equipos={[equipo]} // Only show this equipment
          pautas={templates}
          initialEquipoId={equipo.id}
        />
      )}
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { asignarPautaAMantencion } from "@/app/actions/mantenciones";
import { toast } from "sonner";

interface Pauta {
  id: string;
  codigo: string;
  nombre: string;
  _count?: {
    items: number;
  };
}

interface AsignarPautaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mantencionId: string;
  equipoNombre: string;
  pautas: Pauta[];
}

export default function AsignarPautaModal({
  isOpen,
  onClose,
  mantencionId,
  equipoNombre,
  pautas,
}: AsignarPautaModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPautaId, setSelectedPautaId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPautas = pautas.filter(
    (pauta) =>
      pauta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pauta.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedPautaId) {
      toast.error("Seleccione una pauta");
      return;
    }

    startTransition(async () => {
      try {
        await asignarPautaAMantencion(mantencionId, selectedPautaId);
        toast.success("Pauta asignada correctamente");
        onClose();
        router.refresh();
      } catch (error) {
        console.error("Error assigning pauta:", error);
        toast.error("Error al asignar la pauta");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Asignar Pauta de Mantención
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Para:{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {equipoNombre}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all hover:rotate-90 duration-200"
            >
              <svg
                className="w-5 h-5 text-slate-500"
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
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative group">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar pauta por código o nombre..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              autoFocus
            />
          </div>
        </div>

        {/* Lista de pautas */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredPautas.length === 0 ? (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                No se encontraron pautas
              </p>
              {searchTerm && (
                <p className="text-sm text-slate-400 mt-2">
                  Intente con otro término de búsqueda
                </p>
              )}
              {!searchTerm && pautas.length === 0 && (
                <p className="text-sm text-slate-400 mt-2">
                  Primero debe crear pautas de mantención
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPautas.map((pauta, index) => (
                <label
                  key={pauta.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-[1.01] animate-slide-up ${
                    selectedPautaId === pauta.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md shadow-blue-500/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                  style={{
                    animationDelay: `${index * 30}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <input
                    type="radio"
                    name="pauta"
                    value={pauta.id}
                    checked={selectedPautaId === pauta.id}
                    onChange={() => setSelectedPautaId(pauta.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      selectedPautaId === pauta.id
                        ? "border-blue-500 bg-blue-500"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {selectedPautaId === pauta.id && (
                      <svg
                        className="w-3 h-3 text-white animate-scale-in"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                        {pauta.codigo}
                      </span>
                      {pauta._count && pauta._count.items > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                          {pauta._count.items} items
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white mt-1 truncate">
                      {pauta.nombre}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedPautaId || isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
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
                Asignando...
              </>
            ) : (
              <>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Asignar Pauta
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

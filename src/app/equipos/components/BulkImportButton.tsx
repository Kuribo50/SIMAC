"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/app/components/ui/Modal";
import { processBulkImport } from "@/app/actions/import-equipos";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define minimal types for what we need to generate valid data sheet
interface MinimalEstablecimiento {
  establecimiento: string;
  area: string;
}

interface MinimalTipo {
  subcategoria: string;
  codigo: string;
}

interface BulkImportButtonProps {
  // We can pass these to help users by filling a "Valid Data" sheet
  // If undefined, we just don't populate that sheet or fetch them?
  // For simplicity, let's just use static guidance or assume user knows.
  // Or we can pass them from the server component.
  // Given the user prompt didn't strictly require validation dropdowns, just "según el diseño de la base de datos", I'll stick to a simple template first.
}

export default function BulkImportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: number;
    total: number;
    errors: string[];
  } | null>(null);
  const router = useRouter();

  const handleDownloadTemplate = () => {
    const headers = [
      "Nombre",
      "Marca",
      "Modelo",
      "Serie",
      "Inventario",
      "Estado",
      "Critico",
      "Establecimiento",
      "Area",
      "Tipo",
      "Imagen",
    ];

    const exampleRow = [
      "Monitor Multiparametro",
      "Philips",
      "Efficia CM10",
      "SN123456",
      "INV-001",
      "OPERATIVO",
      "SI",
      "CESFAM CAR",
      "Box Urgencia",
      "Monitor",
      "http://example.com/image.jpg",
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");

    // Add instructions or valid data sheet here if we had the data
    const instructionData = [
      ["Instrucciones"],
      [
        "1. El campo 'Nombre', 'Establecimiento', 'Area' y 'Tipo' son obligatorios.",
      ],
      [
        "2. 'Estado' puede ser: OPERATIVO, NO_OPERATIVO, DE_BAJA, FUERA_SERVICIO, DESCONOCIDO. Por defecto es OPERATIVO.",
      ],
      ["3. 'Critico' debe ser 'SI' o 'NO'."],
      [
        "4. 'Establecimiento' y 'Area' deben coincidir exactamente con los registrados en el sistema.",
      ],
      [
        "5. 'Tipo' debe coincidir con la Subcategoría o Código del tipo de equipo.",
      ],
    ];
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionData);
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instrucciones");

    XLSX.writeFile(wb, "plantilla_importacion_equipos.xlsx");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleSubmit = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const res = await processBulkImport(formData);
      if (res.success && res.results) {
        setResult(res.results);
        if (res.results.errors.length === 0) {
          toast.success(
            `Se importaron ${res.results.success} equipos exitosamente.`
          );
          setIsOpen(false);
          setFile(null);
          setResult(null);
          router.refresh();
        } else {
          toast.warning(
            `Importación parcial: ${res.results.success} de ${res.results.total} importados.`
          );
        }
      } else {
        toast.error(res.error || "Error desconocido al importar.");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-zinc-700 dark:text-slate-200 border border-zinc-200 dark:border-slate-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors shadow-sm font-bold"
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
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        Importar
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Importar Equipos Masivamente"
        description="Sube un archivo Excel para crear equipos. Descarga la plantilla para ver el formato requerido."
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        }
        iconVariant="info"
        footer={
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!file || isPending}
              className="flex-1 px-4 py-2 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Importando..." : "Subir Archivo"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Plantilla Excel</p>
              <p className="text-xs text-slate-500">
                Formato requerido (.xlsx)
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Descargar
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Seleccionar Archivo
            </label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-xl file:border-0
                file:text-sm file:font-semibold
                file:bg-zinc-100 file:text-zinc-700
                hover:file:bg-zinc-200
                cursor-pointer"
            />
          </div>

          {result && (
            <div
              className={`p-4 rounded-xl border ${
                result.errors.length > 0
                  ? "bg-amber-50 border-amber-100"
                  : "bg-emerald-50 border-emerald-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`font-bold ${
                    result.errors.length > 0
                      ? "text-amber-700"
                      : "text-emerald-700"
                  }`}
                >
                  Resultados: {result.success} de {result.total} importados
                </span>
              </div>

              {result.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto mt-2 space-y-1">
                  {result.errors.map((err, idx) => (
                    <p key={idx} className="text-xs text-amber-600 font-mono">
                      • {err}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

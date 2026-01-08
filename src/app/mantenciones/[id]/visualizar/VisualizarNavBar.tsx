"use client";

import { ArrowLeft, Printer, FileDown } from "lucide-react";
import { useRouter } from "next/navigation";
import ExportButtonMantencion from "./ExportButtonMantencion";
import MantencionActions from "./MantencionActions";

interface VisualizarNavBarProps {
  mantencionId: string;
  equipoNombre: string;
  equipoId: string;
  tipoMantencion: string;
  estado: string;
  isAdmin: boolean;
  tieneFirmas: boolean;
  mantencion: any;
}

export default function VisualizarNavBar({
  mantencionId,
  equipoNombre,
  equipoId,
  tipoMantencion,
  estado,
  isAdmin,
  tieneFirmas,
  mantencion,
}: VisualizarNavBarProps) {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-slate-200 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Back Button & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Mantención{" "}
                {tipoMantencion === "PREVENTIVO" ? "Preventiva" : "Correctiva"}
              </h1>
              <p className="text-xs text-slate-500">
                {equipoNombre || "Sin nombre"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Print */}
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Imprimir"
            >
              <Printer className="w-5 h-5" />
            </button>

            {/* Export Excel */}
            <ExportButtonMantencion mantencion={mantencion} />

            {/* Export PDF */}
            <button
              onClick={() => window.print()}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Exportar a PDF"
            >
              <FileDown className="w-5 h-5" />
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            {/* Delete */}
            <MantencionActions
              mantencionId={mantencionId}
              equipoNombre={equipoNombre}
              equipoId={equipoId}
              estado={estado}
              isAdmin={isAdmin}
              tieneFirmas={tieneFirmas}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

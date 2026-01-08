"use client";

import { Printer, FileDown } from "lucide-react";

interface ActionButtonsProps {
  onExport?: () => void;
}

export default function ActionButtons({ onExport }: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      {/* Print Button */}
      <button
        onClick={() => window.print()}
        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        title="Imprimir"
      >
        <Printer className="w-5 h-5" />
      </button>

      {/* Export Button (if provided) */}
      {onExport && (
        <button
          onClick={onExport}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Exportar"
        >
          <FileDown className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

"use client";

interface FolioDisplayProps {
  initialFolio: number | null;
  isCompleted: boolean;
}

export default function FolioDisplay({
  initialFolio,
  isCompleted,
}: FolioDisplayProps) {
  const folio = initialFolio;
  const formattedFolio = folio ? String(folio).padStart(6, "0") : null;

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 print:bg-white print:border-2 print:border-slate-300">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Folio:
        </span>
        {formattedFolio ? (
          <span className="text-lg font-bold text-slate-900 tabular-nums">
            {formattedFolio}
          </span>
        ) : (
          <span className="text-sm text-slate-400 italic">Pendiente</span>
        )}
      </div>
      {!formattedFolio && !isCompleted && (
        <span className="text-[10px] text-slate-400 italic mt-1">
          Se asignará al completar
        </span>
      )}
    </div>
  );
}

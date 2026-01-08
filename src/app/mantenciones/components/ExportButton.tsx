"use client";

import * as XLSX from "xlsx";
import { Button } from "@/app/components/ui/Button";

interface ExportButtonProps {
  record: any;
}

export default function ExportButton({ record }: ExportButtonProps) {
  const handleExport = () => {
    // Flatten data for export
    const data = [
      ["Registro de Checklist"],
      [record.template?.name || "Sin plantilla"],
      [],
      [
        "Equipo",
        record.equipo
          ? `${record.equipo.modelo} - ${record.equipo.serie}`
          : "Sin equipo",
      ],
      ["Centro", record.equipo?.ubicacion?.establecimiento || "-"],
      ["Tipo de Mantenimiento", record.maintenanceType || "-"],
      ["Personal Técnico", record.technicianName || "-"],
      ["Estado", record.status || "-"],
      [
        "Fecha de Creación",
        new Date(record.createdAt).toLocaleDateString("es-CL"),
      ],
      [
        "Fecha de Cierre",
        record.closedAt
          ? new Date(record.closedAt).toLocaleDateString("es-CL")
          : "-",
      ],
      [],
      ["Item", "Actividad", "Completado", "Comentario"],
      ...(record.responses || []).map((response: any, index: number) => [
        index + 1,
        response.item?.description || "-",
        response.isCompleted ? "✔" : "✘",
        response.comment || "-",
      ]),
      [],
      ["Observaciones:", record.observations || "Sin observaciones"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Checklist");

    // Adjust column widths
    ws["!cols"] = [{ wch: 10 }, { wch: 50 }, { wch: 12 }, { wch: 30 }];

    const equipoName = record.equipo
      ? `${record.equipo.modelo}_${record.equipo.serie}`
      : "sin_equipo";
    XLSX.writeFile(
      wb,
      `Checklist_${equipoName}_${
        new Date(record.createdAt).toISOString().split("T")[0]
      }.xlsx`
    );
  };

  return (
    <Button
      onClick={handleExport}
      variant="success"
      className="print:hidden"
      icon={
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      }
    >
      Exportar Excel
    </Button>
  );
}

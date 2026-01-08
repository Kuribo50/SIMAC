"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { getAllMaintenancesForExport } from "../../actions";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/Button";

export default function ExportGlobalButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const records = await getAllMaintenancesForExport();

      if (records.length === 0) {
        toast.error("No hay registros para exportar");
        return;
      }

      const data = records.map((record: any) => ({
        ID: record.id,
        Fecha: new Date(record.createdAt).toLocaleDateString("es-CL"),
        Equipo: record.equipo
          ? `${record.equipo.modelo} - ${record.equipo.serie}`
          : "-",
        Centro: record.equipo?.ubicacion?.establecimiento || "-",
        Tipo: record.maintenanceType,
        Estado: record.status,
        Técnico: record.technicianName || "-",
        Observaciones: record.observations || "-",
        "Fecha Cierre": record.closedAt
          ? new Date(record.closedAt).toLocaleDateString("es-CL")
          : "-",
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Mantenciones");

      XLSX.writeFile(
        workbook,
        `Reporte_Global_Mantenciones_${
          new Date().toISOString().split("T")[0]
        }.xlsx`
      );

      toast.success("Reporte exportado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al exportar reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={loading}
      variant="success"
      icon={
        loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        )
      }
    >
      Exportar Global
    </Button>
  );
}

"use client";

import { utils, writeFile } from "xlsx";
import { FileDown } from "lucide-react";

interface ExportButtonMantencionProps {
  mantencion: any;
}

export default function ExportButtonMantencion({
  mantencion,
}: ExportButtonMantencionProps) {
  const handleExportExcel = () => {
    // Create workbook
    const workbook = utils.book_new();

    // === SHEET 1: Equipment Info & Maintenance Details ===
    const infoData = [
      [
        "PAUTA DE MANTENIMIENTO " +
          (mantencion.tipoMantencion === "PREVENTIVO"
            ? "PREVENTIVA"
            : "CORRECTIVA"),
      ],
      [""],
      ["INFORMACIÓN DEL EQUIPO"],
      [
        "Nombre de Equipo",
        mantencion.equipo?.nombre ||
          mantencion.equipo?.tipoEquipo?.subcategoria ||
          "-",
      ],
      ["Ubicación", mantencion.equipo?.ubicacion?.area || "-"],
      ["Establecimiento", mantencion.equipo?.ubicacion?.establecimiento || "-"],
      ["N° Inventario", mantencion.equipo?.inventario || "-"],
      ["Marca", mantencion.equipo?.marca || "-"],
      ["Modelo", mantencion.equipo?.modelo || "-"],
      ["N° Serie", mantencion.equipo?.serie || "-"],
      [""],
      ["INFORMACIÓN DE LA MANTENCIÓN"],
      [
        "Folio",
        mantencion.folio
          ? String(mantencion.folio).padStart(6, "0")
          : "Pendiente",
      ],
      ["Fecha", new Date(mantencion.fecha).toLocaleDateString("es-CL")],
      ["Tipo", mantencion.tipoMantencion],
      ["Estado", mantencion.estadoMantencion],
      ["Periodicidad", mantencion.periodicidad || "-"],
      ["Equipos de Prueba", mantencion.equiposDePrueba || "-"],
      ["Personal Técnico", mantencion.realizadoPor?.name || "-"],
      ["Pauta", mantencion.pauta?.nombre || "-"],
    ];

    const infoSheet = utils.aoa_to_sheet(infoData);
    infoSheet["!cols"] = [{ wch: 20 }, { wch: 50 }];
    utils.book_append_sheet(workbook, infoSheet, "Información");

    // === SHEET 2: Checklist ===
    if (mantencion.pauta?.items && mantencion.pauta.items.length > 0) {
      const checklistData = [
        ["CHECKLIST DE ACTIVIDADES"],
        [""],
        ["#", "Actividad", "Estado"],
      ];

      mantencion.pauta.items.forEach((item: any, index: number) => {
        const respuesta = mantencion.respuestas?.find(
          (r: any) => r.pautaItemId === item.id
        );
        checklistData.push([
          (index + 1).toString(),
          item.description,
          respuesta?.isCompleted ? "Completado ✓" : "Pendiente",
        ]);
      });

      const checklistSheet = utils.aoa_to_sheet(checklistData);
      checklistSheet["!cols"] = [{ wch: 5 }, { wch: 60 }, { wch: 15 }];
      utils.book_append_sheet(workbook, checklistSheet, "Checklist");
    }

    // === SHEET 3: Observations & Signatures ===
    const obsSignData = [
      ["OBSERVACIONES"],
      [""],
      [mantencion.observaciones || "Sin observaciones"],
      [""],
      [""],
      ["FIRMAS"],
      [""],
      ["Rol", "Nombre", "Cargo", "RUT", "Fecha"],
    ];

    if (mantencion.firmas && mantencion.firmas.length > 0) {
      mantencion.firmas.forEach((firma: any) => {
        obsSignData.push([
          firma.role === "TECNICO" ? "Técnico" : "Responsable",
          firma.nombreFirmante,
          firma.cargoFirmante || "-",
          firma.rutFirmante || "-",
          new Date(firma.firmadoEn).toLocaleDateString("es-CL"),
        ]);
      });
    } else {
      obsSignData.push(["Sin firmas registradas"]);
    }

    const obsSignSheet = utils.aoa_to_sheet(obsSignData);
    obsSignSheet["!cols"] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
    ];
    utils.book_append_sheet(workbook, obsSignSheet, "Observaciones y Firmas");

    // Download file
    const fileName = `Mantencion_${
      mantencion.folio
        ? mantencion.folio.toString().padStart(6, "0")
        : "SinFolio"
    }_${mantencion.equipo?.nombre?.replace(/[^a-zA-Z0-9]/g, "_") || "Equipo"}_${
      new Date(mantencion.fecha).toISOString().split("T")[0]
    }.xlsx`;

    writeFile(workbook, fileName);
  };

  return (
    <button
      onClick={handleExportExcel}
      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
      title="Exportar a Excel"
    >
      <FileDown className="w-5 h-5" />
    </button>
  );
}

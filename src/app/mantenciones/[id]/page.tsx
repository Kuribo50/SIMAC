import { getChecklistRecord } from "../../actions";
import { redirect } from "next/navigation";
import ExportButton from "../components/ExportButton";
import PrintButton from "../components/PrintButton";
import PrintDate from "../components/PrintDate";
import InstitutionalSeal from "../components/InstitutionalSeal";

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const record = await getChecklistRecord(id);

  if (!record) {
    redirect("/mantenciones/historial");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
      {/* Actions Bar (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <div className="flex gap-2">
          <PrintButton />
        </div>
        <div className="flex gap-2 items-center">
          <ExportButton record={record} />
        </div>
      </div>

      {/* Paper Layout - A4 Rigid */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none print:w-full p-[10mm] min-h-[297mm] relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-16 h-16 relative grayscale opacity-80">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-gray-700"
                fill="currentColor"
              >
                <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 90C27.9 90 10 72.1 10 50S27.9 10 50 10s40 17.9 40 40-17.9 40-40 40z" />
                <path d="M50 20c-16.6 0-30 13.4-30 30s13.4 30 30 30 30-13.4 30-30-13.4-30-30-30zm0 50c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 uppercase leading-tight">
                Registro de Checklist
              </h1>
              <p className="text-sm text-gray-700 font-medium">
                {record.template?.name || "Sin plantilla"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              ID Registro
            </p>
            <p className="text-sm font-bold text-blue-900">
              {record.id.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* Main Info Table - Rigid Borders */}
        <div className="border-2 border-black mb-4 text-sm">
          {/* Row 1 */}
          <div className="flex border-b border-black">
            <div className="w-[200px] bg-gray-200 font-bold p-2 border-r border-black flex items-center">
              Equipo
            </div>
            <div className="flex-1 p-2 font-bold uppercase flex items-center bg-gray-50">
              {record.equipo
                ? `${record.equipo.modelo} - ${record.equipo.serie}`
                : "Sin equipo asignado"}
            </div>
          </div>
          {/* Row 2 */}
          <div className="flex border-b border-black">
            <div className="w-[200px] bg-gray-200 font-bold p-2 border-r border-black">
              Centro
            </div>
            <div className="flex-1 p-2 uppercase">
              {record.equipo?.ubicacion?.establecimiento || "-"}
            </div>
          </div>
          {/* Row 3 */}
          <div className="flex border-b border-black">
            <div className="w-[200px] bg-gray-200 font-bold p-2 border-r border-black">
              Tipo de Mantenimiento
            </div>
            <div className="flex-1 p-2 uppercase text-blue-900 font-bold">
              {record.maintenanceType}
            </div>
          </div>
          {/* Row 4 */}
          <div className="flex border-b border-black">
            <div className="w-[200px] bg-gray-200 font-bold p-2 border-r border-black">
              Personal Técnico
            </div>
            <div className="flex-1 p-2 uppercase text-blue-900 font-bold">
              {record.technicianName || "-"}
            </div>
          </div>
          {/* Row 5 */}
          <div className="flex border-b border-black">
            <div className="w-[200px] bg-gray-200 font-bold p-2 border-r border-black">
              Estado
            </div>
            <div className="flex-1 p-2 uppercase">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  record.status === "completado"
                    ? "bg-green-100 text-green-800"
                    : record.status === "anulado"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {record.status}
              </span>
            </div>
          </div>
          {/* Row 6 */}
          <div className="flex">
            <div className="w-[200px] bg-gray-200 font-bold p-2 border-r border-black">
              Fecha de Creación
            </div>
            <div className="flex-1 p-2 uppercase text-blue-900 font-bold">
              {new Date(record.createdAt).toLocaleDateString("es-CL")}
            </div>
          </div>
        </div>

        {/* Checklist Table */}
        <div className="border-2 border-black mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-200 border-b border-black">
                <th className="border-r border-black p-2 w-12 text-center font-bold">
                  Item
                </th>
                <th className="border-r border-black p-2 text-left font-bold">
                  Actividad
                </th>
                <th className="border-r border-black p-2 w-24 text-center font-bold">
                  Check
                </th>
                <th className="p-2 text-left font-bold">Comentario</th>
              </tr>
            </thead>
            <tbody>
              {record.responses && record.responses.length > 0 ? (
                record.responses.map((response: any, index: number) => (
                  <tr
                    key={response.id}
                    className="border-b border-black last:border-0"
                  >
                    <td className="border-r border-black p-2 text-center font-bold bg-gray-100">
                      {index + 1}
                    </td>
                    <td className="border-r border-black p-2 px-2">
                      {response.item?.description || "-"}
                    </td>
                    <td className="border-r border-black p-2 text-center">
                      {response.isCompleted ? (
                        <span className="text-green-600 font-bold text-xl">
                          ✓
                        </span>
                      ) : (
                        <span className="text-red-400">✗</span>
                      )}
                    </td>
                    <td className="p-2 text-sm text-gray-600">
                      {response.comment || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No hay items de checklist registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Observations */}
        <div className="mb-8">
          <h3 className="font-bold mb-1 text-sm">Observaciones:</h3>
          <div className="border border-gray-300 rounded p-3 min-h-[60px] text-sm text-gray-700">
            {record.observations || "Sin observaciones"}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 flex justify-between items-end">
          <div className="text-xs">
            <p>
              Fecha de registro:{" "}
              <span className="text-blue-900 font-bold">
                {new Date(record.createdAt).toLocaleDateString("es-CL")}
              </span>
            </p>
            {record.closedAt && (
              <p>
                Fecha de cierre:{" "}
                <span className="text-green-700 font-bold">
                  {new Date(record.closedAt).toLocaleDateString("es-CL")}
                </span>
              </p>
            )}
          </div>

          {/* Print Date (Client-side only) */}
          <div className="text-[10px] text-gray-400 print:block hidden">
            Impreso el: <PrintDate />
          </div>
        </div>
      </div>
    </div>
  );
}

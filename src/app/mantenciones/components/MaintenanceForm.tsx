"use client";

import { useState } from "react";
import { createChecklistRecord } from "../../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ChecklistItem {
  id: number;
  descripcion: string;
  obligatorio: boolean;
}

interface Template {
  id: number;
  nombre: string;
  items: ChecklistItem[];
}

interface Equipo {
  id: number;
  nombre: string;
  id_equipo?: string;
}

export default function MaintenanceForm({
  equipo,
  template,
}: {
  equipo: Equipo;
  template: Template;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    tipoMantencion: "PREVENTIVA",
    tecnicoNombre: "",
    responsableNombre: "",
    observaciones: "",
    fechaProximaMantencion: "",
  });

  const [items, setItems] = useState<{ [key: number]: boolean }>(
    template.items.reduce((acc, item) => ({ ...acc, [item.id]: false }), {})
  );

  const [submitting, setSubmitting] = useState(false);
  const [noNextDate, setNoNextDate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Validation: Check mandatory items
    const missingMandatory = template.items.filter(
      (item) => item.obligatorio && !items[item.id]
    );

    if (missingMandatory.length > 0) {
      toast.warning("Mantención Parcial", {
        description:
          "Hay ítems obligatorios sin marcar. La mantención se guardará como PARCIAL.",
      });
    }

    try {
      const recordData = {
        equipoId: equipo.id,
        templateId: template.id,
        ...formData,
        fechaProximaMantencion: noNextDate
          ? null
          : formData.fechaProximaMantencion,
        items: Object.entries(items).map(([itemTemplateId, completado]) => ({
          itemTemplateId: parseInt(itemTemplateId),
          completado,
        })),
      };

      await createChecklistRecord(recordData);
      toast.success("Mantención registrada exitosamente");
      router.push("/equipos");
    } catch (error) {
      console.error(error);
      toast.error("Error al registrar mantención", {
        description:
          "Ocurrió un problema al guardar los datos. Intente nuevamente.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
    >
      <div className="bg-slate-800 p-6 text-white">
        <h2 className="text-2xl font-bold">Nueva Mantención</h2>
        <p className="text-slate-300 mt-1">Equipo: {equipo.nombre}</p>
      </div>

      <div className="p-8 space-y-8">
        {/* Section: General Info */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
              1
            </span>
            Información General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                required
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Mantención
              </label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.tipoMantencion}
                onChange={(e) =>
                  setFormData({ ...formData, tipoMantencion: e.target.value })
                }
              >
                <option value="PREVENTIVA">Preventiva</option>
                <option value="CORRECTIVA">Correctiva</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Técnico Responsable
              </label>
              <input
                type="text"
                required
                placeholder="Nombre del técnico"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.tecnicoNombre}
                onChange={(e) =>
                  setFormData({ ...formData, tecnicoNombre: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsable Institucional
              </label>
              <select
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={formData.responsableNombre}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    responsableNombre: e.target.value,
                  })
                }
              >
                <option value="">Seleccione...</option>
                <option value="Juan Pérez">Juan Pérez</option>
                <option value="María González">María González</option>
                <option value="Carlos López">Carlos López</option>
                <option value="Ana Martínez">Ana Martínez</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section: Checklist */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
              2
            </span>
            Checklist: {template.nombre}
          </h3>
          <div className="space-y-3 bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            {template.items.map((item) => (
              <label
                key={item.id}
                className={`flex items-start p-4 cursor-pointer transition-colors ${
                  items[item.id] ? "bg-blue-50/50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all"
                    checked={items[item.id]}
                    onChange={(e) =>
                      setItems({ ...items, [item.id]: e.target.checked })
                    }
                  />
                </div>
                <div className="ml-3 text-sm flex-1">
                  <span
                    className={`font-medium ${
                      items[item.id] ? "text-blue-800" : "text-gray-700"
                    }`}
                  >
                    {item.descripcion}
                  </span>
                  {item.obligatorio && (
                    <span
                      className="text-red-500 ml-1 text-xs font-bold"
                      title="Obligatorio"
                    >
                      *
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Section: Observations */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
              3
            </span>
            Observaciones Finales
          </h3>
          <textarea
            rows={4}
            placeholder="Ingrese cualquier observación relevante sobre la mantención..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={formData.observaciones}
            onChange={(e) =>
              setFormData({ ...formData, observaciones: e.target.value })
            }
          />
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-900">
                Próxima Mantención
              </label>
              <div className="flex items-center">
                <input
                  id="noNextDate"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={noNextDate}
                  onChange={(e) => {
                    setNoNextDate(e.target.checked);
                    if (e.target.checked) {
                      setFormData({ ...formData, fechaProximaMantencion: "" });
                    }
                  }}
                />
                <label
                  htmlFor="noNextDate"
                  className="ml-2 block text-sm text-gray-700"
                >
                  No programar próxima mantención
                </label>
              </div>
            </div>

            <input
              type="date"
              required={!noNextDate}
              disabled={noNextDate}
              className="w-full md:w-1/2 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:text-gray-400"
              value={formData.fechaProximaMantencion}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fechaProximaMantencion: e.target.value,
                })
              }
            />
            <p className="mt-2 text-xs text-gray-500">
              La fecha es obligatoria a menos que se marque la opción de no
              programar.
            </p>
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow transition-all flex items-center"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </>
            ) : (
              "Registrar Mantención"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

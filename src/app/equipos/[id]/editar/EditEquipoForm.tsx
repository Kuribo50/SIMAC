"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEquipo } from "@/app/actions/equipos";
import { toast } from "sonner";

type EstadoEquipo =
  | "OPERATIVO"
  | "NO_OPERATIVO"
  | "DE_BAJA"
  | "FUERA_SERVICIO"
  | "DESCONOCIDO";

interface Props {
  equipo: {
    id: string;
    nombre: string;
    modelo: string | null;
    serie: string | null;
    marca: string | null;
    inventario: string | null;
    estado: string;
    ubicacionId: string;
    tipoEquipoId: string;
    imageUrl: string | null;
  };
  tiposEquipo: {
    id: string;
    codigo: string;
    categoria: string;
    subcategoria: string;
  }[];
  ubicaciones: {
    id: string;
    area: string;
    establecimiento: string;
  }[];
}

export default function EditEquipoForm({
  equipo,
  tiposEquipo,
  ubicaciones,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: equipo.nombre,
    modelo: equipo.modelo || "",
    serie: equipo.serie || "",
    marca: equipo.marca || "",
    inventario: equipo.inventario || "",
    estado: equipo.estado as EstadoEquipo,
    ubicacionId: equipo.ubicacionId,
    tipoEquipoId: equipo.tipoEquipoId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    

    try {
      setSaving(true);
      await updateEquipo(equipo.id, formData);
      toast.success("Equipo actualizado correctamente");
      router.push(`/equipos/${equipo.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el equipo");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "estado" ? (value as EstadoEquipo) : value,
    }));
  };

  // Agrupar tipos de equipo por categoría
  const tiposPorCategoria = tiposEquipo.reduce((acc, tipo) => {
    if (!acc[tipo.categoria]) {
      acc[tipo.categoria] = [];
    }
    acc[tipo.categoria].push(tipo);
    return acc;
  }, {} as Record<string, typeof tiposEquipo>);

  // Agrupar ubicaciones por establecimiento
  const ubicacionesPorEstablecimiento = ubicaciones.reduce((acc, ubi) => {
    if (!acc[ubi.establecimiento]) {
      acc[ubi.establecimiento] = [];
    }
    acc[ubi.establecimiento].push(ubi);
    return acc;
  }, {} as Record<string, typeof ubicaciones>);

  // Verificar si el equipo está de baja
  const isDeBaja = formData.estado === "DE_BAJA";

  // Clases base para inputs normales
  // Clases base para inputs normales
  const inputBaseClass =
    "w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all";

  // Clases para estado DE_BAJA (rojo y deshabilitado)
  // Clases para estado DE_BAJA (rojo y deshabilitado)
  const inputDeBajaClass =
    "w-full px-4 py-2.5 border border-red-300 bg-red-50 text-red-700 rounded-xl cursor-not-allowed";

  // Clase dinámica para inputs
  const getInputClass = () =>
    isDeBaja
      ? inputDeBajaClass
      : `${inputBaseClass} border-slate-300 bg-slate-50 focus:bg-white`;
  const getSelectClass = () =>
    isDeBaja
      ? inputDeBajaClass
      : `${inputBaseClass} border-slate-300 bg-slate-50 focus:bg-white`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Banner de advertencia cuando está DE_BAJA */}
      {isDeBaja && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-2xl">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-red-900">Equipo dado de baja</p>
              <p className="text-sm text-red-700">
                Este equipo está marcado como DE BAJA. Los campos están
                bloqueados. Cambia el estado para volver a editar.
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`bg-white rounded-3xl shadow-sm border ${
          isDeBaja ? "border-red-200" : "border-slate-200"
        } p-8`}
      >
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Información del Equipo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div>
            <label
              className={`block text-sm font-bold ${
                isDeBaja ? "text-red-700" : "text-slate-700"
              } mb-1.5 ml-1`}
            >
              Nombre del Equipo *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={isDeBaja}
              className={getInputClass()}
              required
            />
          </div>

          {/* Tipo de Equipo */}
          <div>
            <label
              className={`block text-sm font-bold ${
                isDeBaja ? "text-red-700" : "text-slate-700"
              } mb-1.5 ml-1`}
            >
              Tipo de Equipo
            </label>
            <select
              name="tipoEquipoId"
              value={formData.tipoEquipoId}
              onChange={handleChange}
              disabled={isDeBaja}
              className={getSelectClass()}
            >
              {Object.entries(tiposPorCategoria).map(([categoria, tipos]) => (
                <optgroup key={categoria} label={categoria}>
                  {tipos.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.subcategoria} ({tipo.codigo})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Ubicación */}
          <div>
            <label
              className={`block text-sm font-bold ${
                isDeBaja ? "text-red-700" : "text-slate-700"
              } mb-1.5 ml-1`}
            >
              Ubicación
            </label>
            <select
              name="ubicacionId"
              value={formData.ubicacionId}
              onChange={handleChange}
              disabled={isDeBaja}
              className={getSelectClass()}
            >
              {Object.entries(ubicacionesPorEstablecimiento).map(
                ([establecimiento, ubis]) => (
                  <optgroup key={establecimiento} label={establecimiento}>
                    {ubis.map((ubi) => (
                      <option key={ubi.id} value={ubi.id}>
                        {ubi.area}
                      </option>
                    ))}
                  </optgroup>
                )
              )}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all ${
                isDeBaja
                  ? "border-red-400 bg-red-100 text-red-800 font-bold"
                  : "border-slate-300 bg-slate-50 focus:bg-white"
              }`}
            >
              <option value="OPERATIVO">Operativo</option>
              <option value="NO_OPERATIVO">No Operativo</option>
              <option value="FUERA_SERVICIO">Fuera de Servicio</option>
              <option value="DE_BAJA">De Baja</option>
            </select>
          </div>

          {/* Marca */}
          <div>
            <label
              className={`block text-sm font-bold ${
                isDeBaja ? "text-red-700" : "text-slate-700"
              } mb-1.5 ml-1`}
            >
              Marca
            </label>
            <input
              type="text"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              disabled={isDeBaja}
              className={getInputClass()}
            />
          </div>

          {/* Modelo */}
          <div>
            <label
              className={`block text-sm font-bold ${
                isDeBaja ? "text-red-700" : "text-slate-700"
              } mb-1.5 ml-1`}
            >
              Modelo
            </label>
            <input
              type="text"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              disabled={isDeBaja}
              className={getInputClass()}
            />
          </div>

          {/* Serie */}
          <div>
            <label
              className={`block text-sm font-bold ${
                isDeBaja ? "text-red-700" : "text-slate-700"
              } mb-1.5 ml-1`}
            >
              Número de Serie
            </label>
            <input
              type="text"
              name="serie"
              value={formData.serie}
              onChange={handleChange}
              disabled={isDeBaja}
              className={getInputClass()}
            />
          </div>

          {/* Inventario */}
          <div>
            <label
              className={`block text-sm font-bold ${
                isDeBaja ? "text-red-700" : "text-slate-700"
              } mb-1.5 ml-1`}
            >
              N° Inventario
            </label>
            <input
              type="text"
              name="inventario"
              value={formData.inventario}
              onChange={handleChange}
              disabled={isDeBaja}
              className={getInputClass()}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-slate-600 hover:text-slate-900 transition-colors font-medium hover:bg-slate-100 rounded-full"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold"
        >
          {saving ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
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
              Guardando...
            </>
          ) : (
            "Guardar Cambios"
          )}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

interface EquipmentHistoryTableProps {
  historial: any[];
}

export default function EquipmentHistoryTable({
  historial,
}: EquipmentHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [typeFilter, setTypeFilter] = useState("TODOS");

  const filteredHistory = historial.filter((record) => {
    const matchesSearch =
      record.tecnicoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.tipoMantencion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.estado.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "TODOS" || record.estado === statusFilter;

    const matchesType =
      typeFilter === "TODOS" || record.tipoMantencion === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-gray-900">
          Historial de Actividades
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="COMPLETADA">Completada</option>
            <option value="PARCIAL">Parcial</option>
            <option value="AGENDADA">Agendada</option>
            <option value="EN_PROCESO">En Proceso</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="PREVENTIVA">Preventiva</option>
            <option value="CORRECTIVA">Correctiva</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Fecha
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Tipo
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Técnico
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredHistory.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-gray-50 transition-colors group"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {new Date(record.fecha).toLocaleDateString("es-CL")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      record.tipoMantencion === "PREVENTIVA"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-orange-50 text-orange-700"
                    }`}
                  >
                    {record.tipoMantencion}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.tecnicoNombre || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.estado === "COMPLETADA"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : record.estado === "PARCIAL"
                        ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                        : record.estado === "AGENDADA"
                        ? "bg-blue-50 text-blue-700 border border-blue-100"
                        : "bg-gray-50 text-gray-700 border border-gray-100"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        record.estado === "COMPLETADA"
                          ? "bg-green-500"
                          : record.estado === "PARCIAL"
                          ? "bg-yellow-500"
                          : record.estado === "AGENDADA"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                    ></span>
                    {record.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/mantenciones/${record.id}`}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {filteredHistory.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg
                      className="w-8 h-8 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <p>No se encontraron registros.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

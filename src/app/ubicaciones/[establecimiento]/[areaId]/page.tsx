"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getUbicaciones } from "../../../actions/ubicaciones";
import { Button } from "../../../components/ui/Button";
import {
  ChevronRight,
  MapPin,
  Building2,
  Package,
  Plus,
  ArrowLeft,
  Search,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function AreaEquiposPage() {
  const params = useParams();
  const establecimiento = decodeURIComponent(params.establecimiento as string);
  const areaId = params.areaId as string;

  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const data = await getUbicaciones();
    setUbicaciones(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Encontrar el área
  const area = useMemo(() => {
    return ubicaciones.find((u) => u.id === areaId);
  }, [ubicaciones, areaId]);

  // Equipos del área
  const equipos = useMemo(() => {
    if (!area?.equipos) return [];
    let filtered = [...area.equipos];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e: any) =>
          e.nombre.toLowerCase().includes(query) ||
          e.marca?.toLowerCase().includes(query) ||
          e.modelo?.toLowerCase().includes(query) ||
          e.serie?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [area, searchQuery]);

  // Info del establecimiento
  const estabInfo = useMemo(() => {
    const areasDelEstab = ubicaciones.filter(
      (u) => u.establecimiento === establecimiento
    );
    const first = areasDelEstab[0] || {};
    return {
      ...first,
      imagen: first.imagenEstablecimiento,
      color: first.colorEstablecimiento,
    };
  }, [ubicaciones, establecimiento]);

  const estabColor = estabInfo.colorEstablecimiento || "#3b82f6";
  const areaColor = area?.color || "#10b981";

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case "OPERATIVO":
      case "operativo":
        return {
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
          text: "text-emerald-700 dark:text-emerald-400",
          dot: "bg-emerald-500",
          label: "Operativo",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "NO_OPERATIVO":
      case "mantencion":
        return {
          bg: "bg-amber-100 dark:bg-amber-900/30",
          text: "text-amber-700 dark:text-amber-400",
          dot: "bg-amber-500",
          label: "En Mantención",
          icon: <Wrench className="w-3.5 h-3.5" />,
        };
      case "FUERA_SERVICIO":
      case "fuera_servicio":
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-700 dark:text-red-400",
          dot: "bg-red-500",
          label: "Fuera de Servicio",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
      default:
        return {
          bg: "bg-slate-100 dark:bg-slate-800",
          text: "text-slate-600 dark:text-slate-400",
          dot: "bg-slate-400",
          label: estado,
          icon: <Clock className="w-3.5 h-3.5" />,
        };
    }
  };

  // Stats de equipos
  const stats = useMemo(() => {
    const total = equipos.length;
    const operativos = equipos.filter(
      (e: any) => e.estado === "OPERATIVO" || e.estado === "operativo"
    ).length;
    const enMantencion = equipos.filter(
      (e: any) => e.estado === "NO_OPERATIVO" || e.estado === "mantencion"
    ).length;

    return { total, operativos, enMantencion };
  }, [equipos]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">
            Cargando equipos...
          </p>
        </div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Área no encontrada
          </p>
          <Link href="/ubicaciones">
            <Button variant="primary">Volver a Ubicaciones</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={`/ubicaciones/${encodeURIComponent(establecimiento)}`}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <div className="flex items-center gap-4 flex-1">
            {area.imagen ? (
              <img
                src={area.imagen}
                alt={area.area}
                className="w-14 h-14 rounded-xl object-cover border-2 border-white dark:border-slate-800 shadow-sm"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: areaColor + "20" }}
              >
                <MapPin className="w-7 h-7" style={{ color: areaColor }} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {area.area}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {establecimiento}
              </p>
            </div>
          </div>
          <Link href="/equipos/nuevo">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Nuevo Equipo
            </Button>
          </Link>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/ubicaciones"
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          >
            Ubicaciones
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <Link
            href={`/ubicaciones/${encodeURIComponent(establecimiento)}`}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          >
            {establecimiento}
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">
            {area.area}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.total}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Equipos
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.operativos}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Operativos
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.enMantencion}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  En Mantención
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de equipos */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                Equipos
              </h2>
              <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full">
                {equipos.length}
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar equipo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Lista */}
          {equipos.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                Sin equipos
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {searchQuery
                  ? "No se encontraron equipos con ese nombre"
                  : "Esta área no tiene equipos registrados"}
              </p>
              {!searchQuery && (
                <Link href="/equipos/nuevo">
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-4"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Agregar Equipo
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {equipos.map((equipo: any) => {
                const estadoConfig = getEstadoConfig(equipo.estado);

                return (
                  <Link
                    key={equipo.id}
                    href={`/equipos/${equipo.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Imagen */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                      {equipo.imageUrl || equipo.imagen ? (
                        <img
                          src={equipo.imageUrl || equipo.imagen}
                          alt={equipo.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {equipo.nombre}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        {equipo.marca && <span>{equipo.marca}</span>}
                        {equipo.marca && equipo.modelo && <span>·</span>}
                        {equipo.modelo && <span>{equipo.modelo}</span>}
                        {equipo.serie && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-xs">
                              S/N: {equipo.serie}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Tipo de equipo */}
                    {equipo.tipoEquipo && (
                      <span className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hidden sm:block">
                        {equipo.tipoEquipo.subcategoria}
                      </span>
                    )}

                    {/* Estado */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${estadoConfig.bg} ${estadoConfig.text}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${estadoConfig.dot}`}
                      ></span>
                      {estadoConfig.label}
                    </span>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  FileText,
  Calendar,
  Wrench,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  SearchX,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MantencionResult {
  id: string;
  folio: number;
  fecha: string;
  tipoMantencion: string;
  estadoMantencion: string;
  equipo: {
    nombre: string;
    marca: string;
    modelo: string;
    ubicacion: {
      area: string;
      establecimiento: string;
    };
  };
  firmas: {
    role: string;
    nombreFirmante: string;
  }[];
}

export default function BuscarFolioPage() {
  const router = useRouter();
  const [folio, setFolio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MantencionResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folio.trim()) {
      setError("Ingresa un folio");
      return;
    }

    const folioNum = parseInt(folio.trim(), 10);
    if (isNaN(folioNum) || folioNum <= 0) {
      setError("Folio inválido");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);

    try {
      const response = await fetch(
        `/api/mantenciones/buscar-folio?folio=${folioNum}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al buscar");
        return;
      }

      if (data.mantencion) {
        setResult(data.mantencion);
      } else {
        setError(`Folio #${folioNum} no encontrado`);
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case "COMPLETADA":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 ring-emerald-500/20";
      case "EN_PROGRESO":
        return "bg-blue-100 text-blue-700 border-blue-200 ring-blue-500/20";
      case "PROGRAMADA":
        return "bg-amber-100 text-amber-700 border-amber-200 ring-amber-500/20";
      case "CANCELADA":
        return "bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/20";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/20";
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "COMPLETADA":
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "EN_PROGRESO":
        return <Clock className="w-3.5 h-3.5" />;
      case "PROGRAMADA":
        return <Calendar className="w-3.5 h-3.5" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const formatEstado = (estado: string) => {
    return estado.replace(/_/g, " ");
  };

  const formatTipo = (tipo: string) => {
    return tipo.replace(/_/g, " ");
  };

  const getSignerName = (role: string) => {
    if (!result) return null;
    const signature = result.firmas.find((f) => f.role === role);
    return signature?.nombreFirmante;
  };

  const tecnicoName = getSignerName("TECNICO");
  const responsableName =
    getSignerName("RESPONSABLE") || getSignerName("SUPERVISOR");

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-6 space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg shadow-slate-200 mb-2 rotate-3"
          >
            <Search className="w-7 h-7" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Buscar Mantención
            </h1>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Consulta el estado de una orden de trabajo.
            </p>
          </div>
        </div>

        {/* Search Form */}
        <motion.form
          onSubmit={handleSearch}
          className="mb-6 relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full opacity-20 group-hover:opacity-40 blur transition duration-500" />
            <div className="relative flex shadow-xl shadow-slate-200/50 rounded-full bg-white p-1.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold text-base">#</span>
                </div>
                <input
                  type="text"
                  value={folio}
                  onChange={(e) => {
                    setFolio(e.target.value);
                    setError(null);
                  }}
                  placeholder="Número de folio..."
                  className="w-full pl-8 pr-4 py-2.5 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-base font-medium rounded-full"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 hover:scale-105 active:scale-95 text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Buscar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>

        <AnimatePresence mode="wait">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center justify-center gap-2 shadow-sm text-sm font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Result Card */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100"
            >
              {/* Result Header */}
              <div className="p-5 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-2xl font-black text-slate-900 tracking-tight">
                        Folio #{result.folio}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ring-1 shadow-sm ${getEstadoStyle(
                          result.estadoMantencion
                        )}`}
                      >
                        {getEstadoIcon(result.estadoMantencion)}
                        {formatEstado(result.estadoMantencion)}
                      </span>
                    </div>
                    <p className="text-slate-500 font-medium text-sm flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {formatTipo(result.tipoMantencion)}
                    </p>
                  </div>
                  <Link
                    href={`/mantenciones/${result.id}/visualizar`}
                    className="shrink-0 px-3 py-1.5 bg-white text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 group"
                  >
                    <FileText className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    Detalle
                  </Link>
                </div>
              </div>

              {/* Result Details */}
              <div className="p-5 grid gap-4">
                {/* Equipo */}
                <div className="flex items-start gap-3 group">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Equipo
                    </p>
                    <p className="font-bold text-slate-900 text-base leading-tight">
                      {result.equipo.nombre}
                    </p>
                    <p className="text-xs text-slate-500">
                      {result.equipo.marca} {result.equipo.modelo}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Ubicación y Fecha Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 group">
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Ubicación
                      </p>
                      <p className="font-bold text-slate-900 text-sm leading-tight">
                        {result.equipo.ubicacion.establecimiento}
                      </p>
                      <p className="text-xs text-slate-500">
                        {result.equipo.ubicacion.area}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Fecha
                      </p>
                      <p className="font-bold text-slate-900 text-sm leading-tight capitalize">
                        {new Date(result.fecha).toLocaleDateString("es-CL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Firmas Section */}
                {result.estadoMantencion === "COMPLETADA" &&
                  (tecnicoName || responsableName) && (
                    <>
                      <div className="h-px bg-slate-100" />
                      <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        {tecnicoName && (
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <UserCheck className="w-3 h-3" />
                              Técnico
                            </span>
                            <span className="text-xs font-semibold text-slate-700 truncate">
                              {tecnicoName}
                            </span>
                          </div>
                        )}
                        {responsableName && (
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <ShieldCheck className="w-3 h-3" />
                              Autorizado
                            </span>
                            <span className="text-xs font-semibold text-slate-700 truncate">
                              {responsableName}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
              </div>

              {/* Result Footer */}
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
                <Link
                  href={`/mantenciones/${result.id}/visualizar`}
                  className="group flex items-center justify-between text-slate-600 hover:text-slate-900 font-bold transition-colors p-2 -m-2 rounded-lg hover:bg-white hover:shadow-sm text-sm"
                >
                  <span>Ver orden completa</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {searched && !result && !error && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 px-6 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-50 text-slate-300 rounded-full mb-3">
                <SearchX className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                No encontrado
              </h3>
              <p className="text-xs text-slate-500">
                Verifique el folio e intente nuevamente.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

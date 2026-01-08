"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getEquipos, getPautas, getScheduledMaintenances } from "../actions";
import ScheduleModal from "./components/ScheduleModal";
import DayMaintenanceList from "./components/DayMaintenanceList";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../components/ui/Button";
import {
  Plus,
  List,
  CalendarDays,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Configure date-fns localizer for Spanish
const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom event styling - simple and clean
const eventStyleGetter = (event: any) => {
  let backgroundColor = "#f1f5f9"; // slate-100
  let color = "#475569"; // slate-600
  let borderLeft = "3px solid #94a3b8"; // slate-400

  if (event.status === "EN_PROCESO") {
    backgroundColor = "#dbeafe"; // blue-100
    color = "#1e40af"; // blue-800
    borderLeft = "3px solid #3b82f6"; // blue-500
  } else if (event.status === "COMPLETADA") {
    backgroundColor = "#d1fae5"; // emerald-100
    color = "#065f46"; // emerald-800
    borderLeft = "3px solid #10b981"; // emerald-500
  }

  return {
    style: {
      backgroundColor,
      color,
      borderLeft,
      borderRadius: "4px",
      padding: "2px 5px",
      fontSize: "12px",
      border: "none",
    },
  };
};

export default function PlanningPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Initial Date Logic ---
  const getInitialDate = () => {
    const fechaParam = searchParams.get("fecha");
    if (fechaParam) {
      const parsed = new Date(`${fechaParam}T12:00:00`);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  };

  // --- State ---
  const [currentDate, setCurrentDate] = useState(getInitialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate);
  const [view, setView] = useState<View>("month");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Data
  const [records, setRecords] = useState<any[]>([]);
  const [equipos, setEquipos] = useState([]);
  const [pautas, setPautas] = useState([]);

  // --- Effects ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eqs, pts, recs] = await Promise.all([
        getEquipos(),
        getPautas(),
        getScheduledMaintenances(
          currentDate.getMonth() + 1,
          currentDate.getFullYear()
        ),
      ]);
      setEquipos(eqs as any);
      setPautas(pts as any);
      setRecords(recs as any);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Convert records to calendar events ---
  const events = useMemo(() => {
    return records.map((record) => {
      const date = new Date(record.fecha);
      return {
        id: record.id,
        title: record.equipo?.nombre || "Sin nombre",
        start: date,
        end: date,
        allDay: true,
        resource: record,
        status: record.estadoMantencion,
      };
    });
  }, [records]);

  // --- Helper to get records for selected date ---
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const getRecordsForDate = (date: Date) => {
    return records.filter((r) => isSameDay(new Date(r.fecha), date));
  };

  const monthlyRecords = records.filter(
    (r) => new Date(r.fecha).getDate() === 1
  );

  const selectedDayRecords = getRecordsForDate(selectedDate);
  const sidebarRecords = isSameDay(
    selectedDate,
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  )
    ? selectedDayRecords
    : [...selectedDayRecords, ...monthlyRecords];

  // --- Statistics ---
  const stats = {
    completed: records.filter((r) => r.estadoMantencion === "COMPLETADA")
      .length,
    pending: records.filter((r) =>
      ["PROGRAMADA", "PENDIENTE"].includes(r.estadoMantencion)
    ).length,
    inProgress: records.filter((r) => r.estadoMantencion === "EN_PROCESO")
      .length,
    total: records.length,
  };

  // --- Event Handlers ---
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedDate(event.start);
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 overflow-hidden font-sans">
      {/* --- Top Bar --- */}
      <div className="flex-shrink-0 px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Planificación
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gestión de mantenciones programadas
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Stats */}
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {stats.completed} Completadas
            </div>
            <div className="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {stats.inProgress} En Proceso
            </div>
            <div className="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              {stats.total} Total
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/pautas")}
            icon={<List className="w-4 h-4" />}
          >
            Pautas
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push("/mantenciones/nueva")}
            icon={<Plus className="w-4 h-4" />}
          >
            Nueva
          </Button>

          <div className="w-px h-8 bg-slate-200 mx-1"></div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isSidebarOpen
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            title={
              isSidebarOpen ? "Ocultar panel lateral" : "Mostrar panel lateral"
            }
          >
            {isSidebarOpen ? (
              <PanelRightClose className="w-5 h-5" />
            ) : (
              <PanelRightOpen className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar Area */}
        <div className="flex-1 flex flex-col min-w-0 p-6 bg-slate-50 dark:bg-slate-950">
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              view={view}
              date={currentDate}
              selectable
              eventPropGetter={eventStyleGetter}
              messages={{
                next: "Siguiente",
                previous: "Anterior",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                agenda: "Agenda",
                date: "Fecha",
                time: "Hora",
                event: "Evento",
                noEventsInRange: "No hay mantenciones en este rango",
                showMore: (total) => `+ ${total} más`,
              }}
              culture="es"
            />
          </div>
        </div>

        {/* Right Sidebar: Details - Collapsible */}
        <div
          className={`
             border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col z-10 shadow-xl transition-all duration-300 overflow-hidden
             ${
               isSidebarOpen
                 ? "w-80 lg:w-96 translate-x-0"
                 : "w-0 opacity-0 translate-x-full"
             }
        `}
        >
          <div className="min-w-[20rem] h-full flex flex-col">
            <DayMaintenanceList
              date={selectedDate}
              records={sidebarRecords}
              onScheduleNew={() => setIsModalOpen(true)}
              onRefresh={fetchData}
            />
          </div>
        </div>
      </div>

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchData();
        }}
        selectedDate={selectedDate}
        equipos={equipos}
        pautas={pautas}
      />

      <style jsx global>{`
        /* Dark Mode Overrides for Calendar */
        :global(.dark) .rbc-header {
          background-color: #0f172a; /* slate-900 */
          color: #e2e8f0; /* slate-200 */
          border-bottom: 2px solid #1e293b; /* slate-800 */
        }
        :global(.dark) .rbc-month-row {
          border-top: 1px solid #1e293b; /* slate-800 */
        }
        :global(.dark) .rbc-day-bg {
          border-left: 1px solid #1e293b; /* slate-800 */
        }
        :global(.dark) .rbc-today {
          background-color: #1e293b; /* slate-800 */
        }
        :global(.dark) .rbc-off-range-bg {
          background-color: #020617; /* slate-950 */
        }
        :global(.dark) .rbc-date-cell > a {
          color: #cbd5e1; /* slate-300 */
        }
        :global(.dark) .rbc-toolbar {
          background-color: #0f172a; /* slate-900 */
          border-color: #1e293b; /* slate-800 */
        }
        :global(.dark) .rbc-toolbar button {
          color: #cbd5e1; /* slate-300 */
          background-color: #1e293b; /* slate-800 */
          border-color: #334155; /* slate-700 */
        }
        :global(.dark) .rbc-toolbar button:hover {
          background-color: #334155; /* slate-700 */
          border-color: #475569; /* slate-600 */
        }
        :global(.dark) .rbc-toolbar button:active,
        :global(.dark) .rbc-toolbar button.rbc-active {
          background-color: #2563eb; /* blue-600 */
          border-color: #2563eb;
        }
        :global(.dark) .rbc-toolbar-label {
          color: #f8fafc; /* slate-50 */
        }
      `}</style>
    </div>
  );
}

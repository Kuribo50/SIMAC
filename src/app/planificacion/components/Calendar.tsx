"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CalendarProps {
  records: any[];
  onDateClick: (date: Date) => void;
  currentDate: Date;
  onMonthChange: (date: Date) => void;
}

export default function Calendar({
  records,
  onDateClick,
  currentDate,
  onMonthChange,
}: CalendarProps) {
  const router = useRouter();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0 = Sunday
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const handlePrevMonth = () => {
    onMonthChange(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    onMonthChange(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const getRecordsForDate = (date: Date) => {
    // Filtrar mantenciones por fecha específica
    return records.filter((r) => {
      const recordDate = new Date(r.fecha);
      return (
        recordDate.getDate() === date.getDate() &&
        recordDate.getMonth() === date.getMonth() &&
        recordDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-stone-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-stone-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-calendar text-blue-600 dark:text-blue-400"
          >
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
          </svg>
          {monthNames[currentDate.getMonth()]}{" "}
          <span className="text-slate-400 font-normal">
            {currentDate.getFullYear()}
          </span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-left"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-right"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 border-b border-stone-100 dark:border-slate-800 uppercase tracking-wider">
        <div className="py-4">Lun</div>
        <div className="py-4">Mar</div>
        <div className="py-4">Mié</div>
        <div className="py-4">Jue</div>
        <div className="py-4">Vie</div>
        <div className="py-4 text-rose-500 dark:text-rose-400">Sáb</div>
        <div className="py-4 text-rose-500 dark:text-rose-400">Dom</div>
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7 auto-rows-fr bg-stone-100 dark:bg-slate-800 gap-[1px] border-b border-stone-100 dark:border-slate-800">
        {days.map((date, index) => {
          if (!date)
            return (
              <div
                key={`empty-${index}`}
                className="bg-white dark:bg-slate-900 min-h-[140px]"
              />
            );

          const dayRecords = getRecordsForDate(date);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={date.toISOString()}
              onClick={() => onDateClick(date)}
              className={`bg-white dark:bg-slate-900 min-h-[140px] p-2 cursor-pointer transition-all relative group
                ${
                  isToday
                    ? "bg-blue-50/30 dark:bg-blue-900/10"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                }
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {date.getDate()}
                </span>
                {isToday && (
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mr-1">
                    Hoy
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                {dayRecords.slice(0, 3).map((record) => (
                  <div
                    key={record.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick(date);
                    }}
                    className={`text-[11px] px-2 py-1 rounded-md border text-left truncate transition-all shadow-sm ${
                      record.estadoMantencion === "COMPLETADA"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800"
                        : record.estadoMantencion === "EN_PROCESO"
                        ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                        : "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
                    }`}
                    title={`${record.equipo?.nombre || ""} - ${
                      record.equipo?.ubicacion?.area || ""
                    }`}
                  >
                    <span className="font-semibold">
                      {record.equipo?.nombre || "Equipo"}
                    </span>
                  </div>
                ))}
                {dayRecords.length > 3 && (
                  <div className="text-[10px] text-slate-400 font-medium px-2 py-0.5 text-center bg-slate-100 dark:bg-slate-800 rounded-full mx-2">
                    +{dayRecords.length - 3} más
                  </div>
                )}
              </div>

              {/* Add Button on Hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg hover:bg-blue-700 dark:hover:bg-blue-400 hover:scale-105 transition-all">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

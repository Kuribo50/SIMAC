// components/dashboard/DashboardCharts.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

// Tipos de datos
interface ActivityData {
  name: string;
  completadas: number;
  enProceso: number;
  pendientes: number;
}

interface MaintenanceChartProps {
  data: ActivityData[];
}

export function MaintenanceChart({ data }: MaintenanceChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#334155" : "#e7e5e4";
  const tooltipBg = isDark ? "#1e293b" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e7e5e4";
  const tooltipText = isDark ? "#f1f5f9" : "#0f172a";

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-stone-200 dark:border-slate-800 shadow-sm h-[300px] flex flex-col">
      <h3 className="text-slate-900 dark:text-slate-100 text-base font-bold mb-4">
        Actividad Últimos 7 Días
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridColor}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: axisColor, fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                borderRadius: "12px",
                color: tooltipText,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{ color: tooltipText, fontWeight: 600 }}
              cursor={{ fill: isDark ? "#334155" : "#f5f5f4" }}
            />
            <Bar
              dataKey="completadas"
              name="Completadas"
              fill="#059669"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="enProceso"
              name="En Proceso"
              fill="#d97706"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="pendientes"
              name="Pendientes"
              fill="#94a3b8"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

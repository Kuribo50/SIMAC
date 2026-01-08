"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

interface DashboardFilterProps {
  centros: string[];
}

export function DashboardFilter({ centros }: DashboardFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCentro = searchParams.get("centro") || "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("centro", val);
    } else {
      params.delete("centro");
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Filter className="h-4 w-4 text-slate-500" />
        </div>
        <select
          value={currentCentro}
          onChange={handleChange}
          className="pl-9 pr-8 py-2 text-sm bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 dark:text-slate-200 appearance-none shadow-sm cursor-pointer min-w-[200px]"
        >
          <option value="">Todos los Centros</option>
          {centros.map((centro) => (
            <option key={centro} value={centro}>
              {centro}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

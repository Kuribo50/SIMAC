import { ReactNode } from "react";

type StatVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  variant?: StatVariant;
  trend?: {
    value: string;
    positive?: boolean;
  };
  subtitle?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  variant = "default",
  trend,
  subtitle,
  className = "",
}: StatCardProps) {
  const iconContainerClasses = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
    danger: "bg-red-100 text-red-600",
    info: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  };

  const valueClasses = {
    default: "text-slate-900",
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-red-600",
    info: "text-blue-600",
    purple: "text-purple-600",
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className={`p-3 rounded-xl ${iconContainerClasses[variant]}`}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${valueClasses[variant]}`}>
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                  trend.positive
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-red-700 bg-red-50"
                }`}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

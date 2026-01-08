import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-16 bg-white rounded-2xl border border-slate-200 ${className}`}
    >
      {icon && (
        <div className="inline-flex items-center justify-center p-4 bg-slate-100 rounded-2xl mb-4">
          <span className="text-slate-400">{icon}</span>
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {description && (
        <p className="text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

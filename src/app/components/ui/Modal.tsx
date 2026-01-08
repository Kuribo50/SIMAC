import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  iconVariant?: "default" | "danger" | "warning" | "success" | "info";
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  iconVariant = "default",
  children,
  footer,
}: ModalProps) {
  if (!isOpen) return null;

  const iconContainerClasses = {
    default: "bg-slate-100",
    danger: "bg-red-100",
    warning: "bg-amber-100",
    success: "bg-emerald-100",
    info: "bg-blue-100",
  };

  const iconTextClasses = {
    default: "text-slate-600",
    danger: "text-red-600",
    warning: "text-amber-600",
    success: "text-emerald-600",
    info: "text-blue-600",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            {icon && (
              <div
                className={`p-3 rounded-xl ${iconContainerClasses[iconVariant]}`}
              >
                <span className={iconTextClasses[iconVariant]}>{icon}</span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              {description && (
                <p className="text-sm text-slate-500 mt-1">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="text-sm text-slate-600">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

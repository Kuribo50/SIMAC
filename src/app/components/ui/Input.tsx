import {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  helperText?: string;
}

export function Input({
  label,
  error,
  icon,
  helperText,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-400">{icon}</span>
          </div>
        )}
        <input
          className={`
            w-full px-4 py-2.5 
            bg-white border border-slate-300 rounded-xl
            text-slate-900 placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            transition-colors duration-200
            ${icon ? "pl-10" : ""}
            ${
              error
                ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                : ""
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {helperText && !error && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  helperText?: string;
}

export function Select({
  label,
  error,
  options,
  helperText,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-2.5
          bg-white border border-slate-300 rounded-xl
          text-slate-900
          focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900
          disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
          transition-colors duration-200
          ${
            error
              ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
              : ""
          }
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && !error && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-2.5
          bg-white border border-slate-300 rounded-xl
          text-slate-900 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900
          disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
          transition-colors duration-200 resize-none
          ${
            error
              ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
              : ""
          }
          ${className}
        `}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

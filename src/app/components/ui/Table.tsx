import { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return (
    <thead className={`bg-slate-50 border-b border-slate-200 ${className}`}>
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return (
    <tbody className={`divide-y divide-slate-100 ${className}`}>
      {children}
    </tbody>
  );
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function TableRow({
  children,
  className = "",
  hover = true,
  onClick,
}: TableRowProps) {
  return (
    <tr
      className={`
        ${hover ? "hover:bg-slate-50 transition-colors" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  header?: boolean;
  align?: "left" | "center" | "right";
}

export function TableCell({
  children,
  className = "",
  header = false,
  align = "left",
}: TableCellProps) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const Component = header ? "th" : "td";

  return (
    <Component
      className={`
        px-5 py-3.5
        ${alignClasses[align]}
        ${
          header
            ? "text-slate-600 font-semibold uppercase text-xs tracking-wide"
            : "text-slate-700"
        }
        ${className}
      `}
    >
      {children}
    </Component>
  );
}

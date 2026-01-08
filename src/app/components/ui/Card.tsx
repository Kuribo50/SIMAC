import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  className = "",
  hover = false,
  padding = "none",
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-200 shadow-sm
        ${
          hover
            ? "hover:shadow-md hover:border-slate-300 transition-all duration-200"
            : ""
        }
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  border?: boolean;
}

export function CardHeader({
  children,
  className = "",
  border = true,
}: CardHeaderProps) {
  return (
    <div
      className={`
        px-5 py-4
        ${border ? "border-b border-slate-100" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
  border?: boolean;
}

export function CardFooter({
  children,
  className = "",
  border = true,
}: CardFooterProps) {
  return (
    <div
      className={`
        px-5 py-4 bg-slate-50/50
        ${border ? "border-t border-slate-100" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

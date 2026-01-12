import clsx from "clsx";
import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  color?: "info" | "success" | "warning" | "danger" | "neutral";
  className?: string;
};

const colorMap = {
  info: "bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900",
  success: "bg-emerald-50 dark:bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900",
  warning: "bg-amber-50 dark:bg-amber-600/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900",
  danger: "bg-red-50 dark:bg-red-600/10 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900",
  neutral: "bg-background dark:bg-card text-muted border-border",
};

export function Badge({ children, color = "neutral", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-tight",
        colorMap[color],
        className
      )}
    >
      {children}
    </span>
  );
}

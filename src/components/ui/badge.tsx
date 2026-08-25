import clsx from "clsx";
import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  color?: "info" | "success" | "warning" | "danger" | "neutral";
  className?: string;
};

// Stamp-style color map: text-forward, bordered, no pill fills
const colorMap = {
  // graphite / neutral blue-tone → use ink
  info:    "text-[#44403C] border-[#A09080] bg-transparent",
  // forest green → resolved
  success: "text-[#14532D] border-[#14532D] bg-transparent",
  // ochre → pending
  warning: "text-[#92400E] border-[#92400E] bg-transparent",
  // ink-red → urgent / danger
  danger:  "text-[#8B2326] border-[#8B2326] bg-transparent",
  // faintest ink
  neutral: "text-[#78716C] border-[#D6CFC4] bg-transparent",
};

export function Badge({ children, color = "neutral", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        // Stamp: no pill, hard corner, monospace uppercase
        "inline-flex items-center gap-1 border px-1.5 py-px",
        "font-mono text-[10px] font-bold tracking-widest uppercase",
        "rounded-[1px]",
        colorMap[color],
        className
      )}
    >
      {children}
    </span>
  );
}

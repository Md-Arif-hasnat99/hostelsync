import clsx from "clsx";
import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; helperText?: string };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helperText, id, children, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={selectId} className="text-[12px] font-bold uppercase tracking-wider text-[#44403C]">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              "w-full appearance-none border border-border bg-card px-3 py-2.5 text-sm transition-all pr-9",
              "focus:border-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]/20",
              "text-foreground rounded-[2px]",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
        {helperText ? <p className="text-xs font-medium text-muted">{helperText}</p> : null}
      </div>
    );
  }
);

Select.displayName = "Select";

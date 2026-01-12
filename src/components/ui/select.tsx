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
          <label htmlFor={selectId} className="text-[13px] font-bold text-foreground">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              "w-full appearance-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-foreground pr-10",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
        {helperText ? <p className="text-xs font-medium text-muted">{helperText}</p> : null}
      </div>
    );
  }
);

Select.displayName = "Select";

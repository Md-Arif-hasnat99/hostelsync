import clsx from "clsx";
import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; helperText?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-[12px] font-bold uppercase tracking-wider text-[#44403C]">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full border border-border bg-card px-3 py-2.5 text-sm transition-all",
            "focus:border-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]/20",
            "placeholder:text-muted text-foreground rounded-[2px]",
            className
          )}
          {...props}
        />
        {helperText ? <p className="text-xs font-medium text-muted">{helperText}</p> : null}
      </div>
    );
  }
);

Input.displayName = "Input";

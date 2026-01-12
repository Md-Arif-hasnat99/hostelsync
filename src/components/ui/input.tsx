import clsx from "clsx";
import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; helperText?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-[13px] font-bold text-foreground">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-muted text-foreground",
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

import clsx from "clsx";
import { forwardRef, TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; helperText?: string };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, id, ...props }, ref) => {
    const areaId = id || props.name;
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={areaId} className="text-[13px] font-bold text-foreground">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={areaId}
          className={clsx(
            "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-muted text-foreground min-h-[100px]",
            className
          )}
          {...props}
        />
        {helperText ? <p className="text-xs font-medium text-muted">{helperText}</p> : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

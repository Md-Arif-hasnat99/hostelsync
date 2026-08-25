import clsx from "clsx";
import { forwardRef, TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; helperText?: string };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, id, ...props }, ref) => {
    const areaId = id || props.name;
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={areaId} className="text-[12px] font-bold uppercase tracking-wider text-[#44403C]">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={areaId}
          className={clsx(
            "w-full border border-border bg-card px-3 py-2.5 text-sm transition-all",
            "focus:border-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]/20",
            "placeholder:text-muted text-foreground min-h-[100px] rounded-[2px] resize-y",
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

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonStyles = cva(
  // Base: no pill, hard corner, ink-forward, no colored shadows
  "inline-flex items-center justify-center rounded-[2px] text-sm font-bold transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] tracking-wide",
  {
    variants: {
      variant: {
        primary:   "bg-foreground text-background hover:bg-muted/80 border border-foreground",
        secondary: "bg-card text-foreground hover:bg-border/50 border border-border",
        outline:   "border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
        ghost:     "text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
        danger:    "bg-accent text-background hover:bg-accent/90 border border-accent",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-7 py-3.5 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & { asChild?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={clsx(buttonStyles({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

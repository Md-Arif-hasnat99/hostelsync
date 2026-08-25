import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonStyles = cva(
  // Base: no pill, hard corner, ink-forward, no colored shadows
  "inline-flex items-center justify-center rounded-[2px] text-sm font-bold transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B2326] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] tracking-wide",
  {
    variants: {
      variant: {
        primary:   "bg-[#1C1917] text-[#F5F0E8] hover:bg-[#44403C] border border-[#1C1917]",
        secondary: "bg-[#EDE8DF] text-[#1C1917] hover:bg-[#D6CFC4] border border-[#D6CFC4]",
        outline:   "border border-[#1C1917] bg-transparent text-[#1C1917] hover:bg-[#1C1917] hover:text-[#F5F0E8]",
        ghost:     "text-[#44403C] hover:bg-[#EDE8DF] hover:text-[#1C1917]",
        danger:    "bg-[#8B2326] text-[#F5F0E8] hover:bg-[#6B1B1D] border border-[#8B2326]",
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

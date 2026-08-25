import { ReactNode } from "react";
import clsx from "clsx";

type CardProps = {
  children: ReactNode;
  className?: string;
};

// Flat bordered panel — no shadow, no rounded-2xl. Ledger aesthetic.
export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx("border border-border bg-card", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={clsx("flex flex-col space-y-1 p-5 border-b border-border", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardProps) {
  return <div className={clsx("p-5", className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <div className={clsx("flex items-center p-5 border-t border-border", className)}>
      {children}
    </div>
  );
}

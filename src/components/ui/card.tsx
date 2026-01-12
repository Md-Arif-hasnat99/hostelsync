import { ReactNode } from "react";
import clsx from "clsx";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div className={clsx("rounded-2xl border border-border bg-card shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={clsx("flex flex-col space-y-1.5 p-6", className)}>{children}</div>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={clsx("p-6 pt-0", className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return <div className={clsx("flex items-center p-6 pt-0", className)}>{children}</div>;
}

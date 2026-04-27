import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-slate-950 bg-slate-950 text-white hover:bg-slate-800 hover:border-slate-800",
  secondary:
    "border-slate-300 bg-white text-slate-950 hover:border-slate-950 hover:bg-slate-50",
  ghost:
    "border-transparent bg-transparent text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950",
  danger:
    "border-rose-600 bg-rose-600 text-white hover:border-rose-700 hover:bg-rose-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "px-4 py-3 text-sm",
  lg: "px-6 py-3.5 text-sm",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
  disabled,
  isLoading,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 border font-semibold transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/20",
    sizeClasses[size],
    variantClasses[variant],
    (disabled || isLoading) && "cursor-not-allowed opacity-70",
    className
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingLabel,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={buttonClassName({
        variant,
        size,
        className,
        disabled,
        isLoading,
      })}
    >
      {isLoading ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          <span>{loadingLabel || children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "dark" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary text-white border-none hover:bg-primary-hover",
  secondary: "bg-white text-[#334155] border border-border hover:bg-[#F1F5F9]",
  dark: "bg-sidebar text-white border-none hover:bg-[#1E293B]",
  danger: "bg-[#DC2626] text-white border-none hover:bg-[#B91C1C]",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`rounded-btn px-[18px] py-[11px] text-sm font-semibold cursor-pointer inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        VARIANT_CLASSES[variant]
      } ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

import type { ReactNode } from "react";

interface BadgeProps {
  bg: string;
  color: string;
  children: ReactNode;
  className?: string;
}

export function Badge({ bg, color, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`text-[11.5px] font-bold px-[9px] py-[3px] rounded-full inline-flex items-center gap-1 ${className}`}
      style={{ background: bg, color }}
    >
      {children}
    </span>
  );
}

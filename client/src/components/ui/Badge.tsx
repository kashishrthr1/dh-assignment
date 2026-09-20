import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "emerald"
    | "cyan"
    | "gold"
    | "crimson"
    | "slate"
    | "outline"
    | "rose"
    | "amber"
    | "muted";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "emerald",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variants: Record<string, string> = {
    emerald: "bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/25",
    cyan: "bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/25",
    gold: "bg-[#FFB020]/15 text-[#FFB020] border border-[#FFB020]/30",
    amber: "bg-[#FFB020]/15 text-[#FFB020] border border-[#FFB020]/30",
    crimson: "bg-[#FF4D6D]/10 text-[#FF4D6D] border border-[#FF4D6D]/25",
    rose: "bg-[#FF4D6D]/10 text-[#FF4D6D] border border-[#FF4D6D]/25",
    slate: "bg-white/[0.06] text-slate-300 border border-white/[0.1]",
    muted: "bg-white/[0.06] text-slate-400 border border-white/[0.1]",
    outline: "bg-transparent text-slate-400 border border-white/[0.15]",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5 font-medium rounded-md uppercase tracking-wider",
    md: "text-xs px-2.5 py-1 font-semibold rounded-lg",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 transition-colors",
        variants[variant] || variants.emerald,
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

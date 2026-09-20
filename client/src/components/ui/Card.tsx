import React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  glow?: "emerald" | "cyan" | "gold" | "none";
  variant?: "default" | "neon" | "glass";
}

export function Card({
  className,
  glass = true,
  glow = "none",
  variant = "default",
  children,
  ...props
}: CardProps) {
  const glowStyles = {
    none: "",
    emerald: "border-[#00F5A0]/25 shadow-lg shadow-[#00F5A0]/10",
    cyan: "border-[#00D2FF]/25 shadow-lg shadow-[#00D2FF]/10",
    gold: "border-[#FFB020]/25 shadow-lg shadow-[#FFB020]/10",
  };

  const variantStyles = {
    default: glass ? "glass-panel" : "bg-[#0D1322] border border-white/[0.08]",
    neon: "glass-panel border-primary-emerald/30 shadow-neon",
    glass: "glass-panel",
  };

  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-300",
        variantStyles[variant],
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-6 pb-3 flex flex-col space-y-1.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-3", className)} {...props}>
      {children}
    </div>
  );
}

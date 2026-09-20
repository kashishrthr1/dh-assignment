import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#070A12] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-[#00F5A0] text-[#070A12] hover:bg-[#00D084] shadow-lg shadow-[#00F5A0]/20 hover:shadow-[#00F5A0]/35 focus:ring-[#00F5A0]",
      secondary:
        "bg-white/[0.08] text-white hover:bg-white/[0.14] border border-white/[0.1] focus:ring-white/20",
      outline:
        "bg-transparent text-slate-200 border border-white/[0.15] hover:bg-white/[0.05] hover:border-white/[0.3] focus:ring-white/20",
      ghost:
        "bg-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] focus:ring-white/10",
      gold:
        "bg-gradient-to-r from-[#FFB020] via-[#FF8A00] to-[#E65100] text-black hover:opacity-95 shadow-lg shadow-[#FFB020]/25 focus:ring-[#FFB020]",
      danger:
        "bg-[#FF4D6D] text-white hover:bg-[#E03A58] shadow-lg shadow-[#FF4D6D]/20 focus:ring-[#FF4D6D]",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

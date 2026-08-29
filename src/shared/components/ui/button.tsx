"use client";

import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "cobalt"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "glass"
    | "glassPrimary";
  size?: "sm" | "default" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "default",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-160 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variantStyles: Record<string, string> = {
      primary: "bg-[#1E293B] text-white hover:bg-[#2B3B52] active:bg-[#0F172A] shadow-sm",
      cobalt:
        "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm shadow-blue-500/20",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300",
      outline:
        "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100",
      ghost: "text-slate-700 hover:bg-slate-100/80 active:bg-slate-200/80",
      destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
      glass:
        "bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-800 hover:bg-white active:bg-slate-100 shadow-sm",
      glassPrimary:
        "bg-blue-600/90 backdrop-blur-md border border-blue-400/30 text-white hover:bg-blue-600 active:bg-blue-700 shadow-md shadow-blue-500/20",
    };

    const sizeStyles: Record<string, string> = {
      sm: "min-h-[36px] px-3 py-1.5 text-xs rounded-lg gap-1.5",
      default: "min-h-[44px] px-4 py-2 text-sm rounded-xl gap-2",
      lg: "min-h-[48px] px-6 py-3 text-base rounded-xl gap-2.5",
      icon: "min-h-[44px] min-w-[44px] p-2.5 rounded-xl justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${
          sizeStyles[size] || sizeStyles.default
        } ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Memproses...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

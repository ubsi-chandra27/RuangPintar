import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "sm" | "default" | "lg";
  isError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className = "", type = "text", inputSize = "lg", isError = false, disabled, ...props },
    ref
  ) => {
    const sizeStyles = {
      sm: "h-9 px-3 text-xs rounded-lg",
      default: "h-11 px-3.5 text-sm rounded-[10px]",
      lg: "h-12 px-4 text-[15px] rounded-[10px]",
    };

    const errorStyles = isError
      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 dark:border-rose-600 dark:text-rose-100"
      : "border-[#CBD5E1] focus:border-[#3B82F6] focus:ring-[#3B82F6]/25 text-[#0F172A] dark:border-slate-700 dark:text-slate-100";

    return (
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        className={`w-full border bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-3 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:opacity-60 transition-all duration-160 ${sizeStyles[inputSize]} ${errorStyles} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

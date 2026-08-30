import * as React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, id, disabled, ...props }, ref) => {
    const defaultId = React.useId();
    const inputId = id || defaultId;

    return (
      <label
        htmlFor={inputId}
        className={`inline-flex items-center gap-2.5 min-h-[44px] cursor-pointer select-none text-sm text-[#475569] dark:text-slate-300 ${
          disabled ? "cursor-not-allowed opacity-60" : ""
        }`}
      >
        <input
          id={inputId}
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className={`size-[18px] rounded-[5px] border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#2563EB] focus:ring-3 focus:ring-[#3B82F6]/25 disabled:cursor-not-allowed transition-all duration-160 ${className}`}
          {...props}
        />
        {label && <span>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

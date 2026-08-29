import * as React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  requiredIndicator?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", requiredIndicator, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`text-sm font-semibold text-[#0F172A] dark:text-slate-200 select-none leading-none inline-flex items-center gap-1 ${className}`}
        {...props}
      >
        {children}
        {requiredIndicator && <span className="text-rose-500">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";

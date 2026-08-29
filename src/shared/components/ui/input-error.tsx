import * as React from "react";
import { AlertCircle } from "lucide-react";

export interface InputErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  message?: string | null;
}

export const InputError = React.forwardRef<HTMLParagraphElement, InputErrorProps>(
  ({ message, className = "", children, ...props }, ref) => {
    const content = message || children;
    if (!content) return null;

    return (
      <p
        ref={ref}
        role="alert"
        className={`text-xs font-medium text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1.5 leading-normal ${className}`}
        {...props}
      >
        <AlertCircle className="size-3.5 shrink-0" />
        <span>{content}</span>
      </p>
    );
  }
);

InputError.displayName = "InputError";

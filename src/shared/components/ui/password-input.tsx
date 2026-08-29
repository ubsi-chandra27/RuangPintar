"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, InputProps } from "./input";

export interface PasswordInputProps extends Omit<InputProps, "type"> {}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = "", disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative w-full">
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          disabled={disabled}
          className={`pr-12 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1}
          aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          disabled={disabled}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 size-9 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none transition-colors duration-160 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

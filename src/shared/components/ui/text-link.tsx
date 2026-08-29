import * as React from "react";
import Link, { LinkProps } from "next/link";

export interface TextLinkProps extends LinkProps {
  className?: string;
  children: React.ReactNode;
}

export const TextLink = React.forwardRef<HTMLAnchorElement, TextLinkProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        className={`text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 rounded transition-colors duration-160 ${className}`}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

TextLink.displayName = "TextLink";

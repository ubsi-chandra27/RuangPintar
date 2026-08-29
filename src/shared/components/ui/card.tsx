import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "solid" | "glassSoft" | "glassElevated" | "statCard";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "glassElevated", children, ...props }, ref) => {
    const variantStyles: Record<string, string> = {
      solid: "bg-white border border-slate-200 shadow-sm",
      glassSoft: "bg-white/75 backdrop-blur-md border border-white/60 shadow-sm",
      glassElevated:
        "bg-white/90 backdrop-blur-lg border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow duration-200",
      statCard:
        "bg-white/90 backdrop-blur-lg border border-slate-200/80 shadow-sm p-5 hover:border-blue-200 hover:shadow-md transition-all duration-200",
    };

    return (
      <div
        ref={ref}
        className={`rounded-2xl ${variantStyles[variant] || variantStyles.glassElevated} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = "", ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight text-slate-900 ${className}`}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <p ref={ref} className={`text-sm text-slate-500 leading-relaxed ${className}`} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`flex items-center p-6 pt-0 ${className}`} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

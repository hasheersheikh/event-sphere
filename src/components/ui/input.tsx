import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "search";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200",
          variant === "search" && "h-12 rounded-xl pl-12 pr-4 text-base shadow-card focus:shadow-card-hover",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

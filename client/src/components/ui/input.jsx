import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border bg-white px-3.5 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:h-11 sm:px-4",
        className
      )}
      {...props}
    />
  );
});

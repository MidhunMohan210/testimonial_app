import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[112px] w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:min-h-[120px] sm:px-4 sm:py-3",
        className
      )}
      {...props}
    />
  );
});

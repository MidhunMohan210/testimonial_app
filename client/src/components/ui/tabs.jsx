import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn("inline-flex h-10 items-center rounded-xl bg-muted p-1 sm:h-11", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:h-9 sm:px-4",
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content className={cn("mt-5 sm:mt-6", className)} {...props} />;
}

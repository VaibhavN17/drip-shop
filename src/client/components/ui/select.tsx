import * as React from "react";
import { cn } from "@/lib/utils";

// Simple native-select wrapper — avoids pulling in a heavy Radix Select
// implementation for a shop-counter UI that just needs a reliable dropdown.
export interface SelectOption {
  value: string;
  label: string;
}

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { options: SelectOption[]; placeholder?: string }
>(({ className, options, placeholder, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
      className
    )}
    {...props}
  >
    {placeholder ? <option value="">{placeholder}</option> : null}
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
));
Select.displayName = "Select";

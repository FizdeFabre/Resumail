// src/components/ui/progress.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

export const Progress = React.forwardRef(
  ({ className, value, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner",
          className
        )}
        {...props}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
          style={{ width: `${value || 0}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";
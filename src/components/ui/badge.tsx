import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-indigo-100 text-indigo-700",
        qualified: "bg-green-100 text-green-700",
        new_lead: "bg-blue-100 text-blue-700",
        in_progress: "bg-amber-100 text-amber-700",
        lost: "bg-red-100 text-red-700",
        converted: "bg-purple-100 text-purple-700",
        high: "bg-orange-100 text-orange-700",
        medium: "bg-indigo-100 text-indigo-600",
        low: "bg-gray-100 text-gray-500",
        to_do: "bg-gray-100 text-gray-600",
        in_progress_task: "bg-indigo-100 text-indigo-700",
        completed: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-600",
        active: "bg-green-100 text-green-700",
        pending: "bg-amber-100 text-amber-700",
        outline: "border border-gray-200 text-gray-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

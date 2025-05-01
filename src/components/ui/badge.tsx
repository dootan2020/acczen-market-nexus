
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#19C37D] text-white hover:bg-[#15a76b]",
        secondary: "border-transparent bg-[#343541] text-white dark:bg-white dark:text-[#343541]",
        destructive: "border-transparent bg-[#FF4D4F] text-white hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-[#19C37D] text-white hover:bg-[#15a76b]",
        warning: "border-transparent bg-[#FAAD14] text-white hover:bg-[#E39C13]", 
        info: "border-transparent bg-[#1890FF] text-white hover:bg-[#1683E8]",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

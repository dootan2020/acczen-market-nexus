
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#19C37D] text-white hover:bg-[#15a76b] active:bg-[#108a59]",
        secondary: "bg-white text-[#343541] border border-[#e5e5e5] hover:bg-[#f9f9fa] active:bg-[#f1f1f2]",
        destructive: "bg-[#FF4D4F] text-white hover:bg-[#ff3336] active:bg-[#f02224]",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "text-[#343541] hover:bg-accent hover:text-accent-foreground",
        link: "text-[#19C37D] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      isLoading: {
        true: "relative text-transparent transition-none hover:text-transparent",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      isLoading: false,
    },
  }
)

const LoadingSpinner = ({ className }: { className?: string }) => (
  <Loader2 className={cn("h-4 w-4 animate-spin", className)} />
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading = false, asChild = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, isLoading, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {children}
        {isLoading && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <LoadingSpinner />
          </div>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants, LoadingSpinner }

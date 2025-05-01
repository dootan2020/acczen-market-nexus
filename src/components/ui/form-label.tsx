
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@/lib/utils"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    optional?: boolean;
    error?: boolean;
  }
>(({ className, optional, error, children, ...props }, ref) => {
  return (
    <div className="flex justify-between items-center mb-1.5">
      <LabelPrimitive.Root
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          error && "text-destructive",
          className
        )}
        {...props}
      >
        {children}
      </LabelPrimitive.Root>
      
      {optional && (
        <span className="text-xs text-muted-foreground">Optional</span>
      )}
    </div>
  );
});

FormLabel.displayName = "FormLabel";

export { FormLabel };

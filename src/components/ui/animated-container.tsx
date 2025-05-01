
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type AnimationType = "fade-in" | "slide-in" | "scale-in" | "bounce" | "none";

interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: number;
  delay?: number;
  once?: boolean;
  className?: string;
  as?: React.ElementType;
}

export const AnimatedContainer = forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ 
    children, 
    animation = "fade-in", 
    duration = 300,
    delay = 0,
    once = true,
    className,
    as: Component = "div",
    ...props
  }, ref) => {
    // Define animation classes
    const animationClasses = {
      "fade-in": "animate-fade-in",
      "slide-in": "animate-slide-in",
      "scale-in": "animate-scale-in",
      "bounce": "animate-bounce",
      "none": "",
    };

    // Create style object for duration and delay
    const animationStyle = {
      animationDuration: `${duration}ms`,
      animationDelay: `${delay}ms`,
      animationFillMode: once ? "forwards" : "both",
    };

    return (
      <Component
        ref={ref}
        className={cn(animationClasses[animation], className)}
        style={animation !== "none" ? animationStyle : undefined}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

AnimatedContainer.displayName = "AnimatedContainer";

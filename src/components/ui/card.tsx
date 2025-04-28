
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "elevated" | "flat" | "interactive"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "shadow-sm hover:shadow",
    elevated: "shadow-md hover:shadow-lg",
    flat: "shadow-none",
    interactive: "cursor-pointer hover:-translate-y-1 transition-transform"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground transition-shadow",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 border-b", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// New KPI Card Component
interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  value: string | number
  label: string
  trend?: {
    value: number
    label?: string
    isPositive: boolean
  }
}

const KpiCard = React.forwardRef<HTMLDivElement, KpiCardProps>(
  ({ className, icon, value, label, trend, ...props }, ref) => (
    <Card
      ref={ref}
      variant="elevated"
      className={cn("overflow-hidden", className)}
      {...props}
    >
      <div className="p-6 text-center">
        {icon && (
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 bg-primary-50 text-primary">
            {icon}
          </div>
        )}
        <h3 className="text-3xl font-bold text-neutral-800">{value}</h3>
        <p className="text-sm text-neutral-600 mt-1">{label}</p>
        {trend && (
          <div 
            className={cn(
              "inline-flex items-center mt-2 text-sm font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}
          >
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
            {trend.label && <span className="ml-1">{trend.label}</span>}
          </div>
        )}
      </div>
    </Card>
  )
)
KpiCard.displayName = "KpiCard"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  KpiCard
}

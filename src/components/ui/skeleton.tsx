
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Specific skeleton for chart lines
function SkeletonChartLine() {
  return (
    <div className="space-y-6 py-2">
      <Skeleton className="h-4 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}

// Specific skeleton for stats cards
function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="p-6 space-y-2 border rounded-lg">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
}

export { Skeleton, SkeletonChartLine, SkeletonStats }

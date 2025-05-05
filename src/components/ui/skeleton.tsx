
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

// Specific skeleton for pie charts
function SkeletonChartPie() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-28 mx-auto" />
      <div className="flex justify-center">
        <Skeleton className="h-40 w-40 rounded-full" />
      </div>
    </div>
  )
}

// Specific skeleton for bar charts
function SkeletonChartBar() {
  return (
    <div className="space-y-6 py-2">
      <Skeleton className="h-4 w-full" />
      <div className="space-y-2">
        <div className="flex items-end gap-1 h-40 w-full">
          {[0.6, 0.8, 0.4, 0.7, 0.3, 0.9, 0.5].map((height, i) => (
            <Skeleton key={i} className={`w-full h-[${Math.floor(height * 100)}%]`} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Specific skeleton for table data
function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      <div className="flex w-full items-center space-x-4 pb-4">
        {Array(columns).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <div className="space-y-3">
        {Array(rows).fill(0).map((_, i) => (
          <div key={i} className="flex w-full items-center space-x-4">
            {Array(columns).fill(0).map((_, j) => (
              <Skeleton key={j} className="h-10 w-full" />
            ))}
          </div>
        ))}
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

export { 
  Skeleton, 
  SkeletonChartLine, 
  SkeletonChartPie, 
  SkeletonChartBar, 
  SkeletonStats, 
  SkeletonTable 
}

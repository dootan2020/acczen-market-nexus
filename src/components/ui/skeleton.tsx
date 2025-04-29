
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

/**
 * A collection of skeleton components for common UI patterns
 */
const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("space-y-3", className)}>
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

const SkeletonTable = ({ 
  rows = 5, 
  columns = 4, 
  className 
}: { 
  rows?: number, 
  columns?: number, 
  className?: string 
}) => (
  <div className={cn("space-y-3", className)}>
    <div className="flex space-x-4">
      {Array(columns).fill(0).map((_, i) => (
        <Skeleton key={`header-${i}`} className="h-8 flex-1" />
      ))}
    </div>
    {Array(rows).fill(0).map((_, i) => (
      <div key={`row-${i}`} className="flex space-x-4">
        {Array(columns).fill(0).map((_, j) => (
          <Skeleton key={`cell-${i}-${j}`} className="h-8 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

const SkeletonChartLine = ({ className }: { className?: string }) => (
  <div className={cn("space-y-3", className)}>
    <Skeleton className="h-[300px] w-full" />
  </div>
);

const SkeletonChartBar = ({ className }: { className?: string }) => (
  <div className={cn("space-y-3", className)}>
    <Skeleton className="h-[300px] w-full" />
  </div>
);

const SkeletonChartPie = ({ className }: { className?: string }) => (
  <div className={cn("space-y-3", className)}>
    <Skeleton className="h-[300px] w-full rounded-full mx-auto" style={{ maxWidth: "300px" }} />
  </div>
);

const SkeletonStats = ({ className }: { className?: string }) => (
  <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
    {Array(4).fill(0).map((_, i) => (
      <div key={`stat-${i}`} className="p-6 rounded-lg border">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-7 w-1/2 mt-4" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </div>
    ))}
  </div>
);

export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonTable, 
  SkeletonChartLine,
  SkeletonChartBar,
  SkeletonChartPie,
  SkeletonStats 
}

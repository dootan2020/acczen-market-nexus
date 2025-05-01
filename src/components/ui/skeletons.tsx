
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex flex-col space-y-3 rounded-xl border border-border/40 p-4", className)}>
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between items-end pt-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array(count).fill(null).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const TableRowSkeleton = ({ cols = 5 }: { cols?: number }) => {
  return (
    <div className="flex w-full items-center space-x-4 py-4">
      {Array(cols).fill(null).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-9",
            i === 0 ? "w-12" : "flex-1"
          )} 
        />
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }: { rows?: number, cols?: number }) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex w-full items-center space-x-4 pb-2">
        {Array(cols).fill(null).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              "h-5",
              i === 0 ? "w-12" : "flex-1"
            )} 
          />
        ))}
      </div>
      <div className="divide-y divide-border/20">
        {Array(rows).fill(null).map((_, i) => (
          <TableRowSkeleton key={i} cols={cols} />
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex flex-col space-y-3", className)}>
      <div className="flex justify-between">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
  );
};

export const StatCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex flex-col space-y-3 p-6 rounded-xl border border-border/40", className)}>
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
};

export const StatCardGridSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array(count).fill(null).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const EmptyState = ({ 
  title = "No data found",
  description = "There are no items to display at the moment.",
  icon: Icon,
  action
}: { 
  title?: string, 
  description?: string, 
  icon?: React.ElementType, 
  action?: React.ReactNode 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="rounded-full bg-muted/30 p-6 mb-4">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-medium mt-4">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

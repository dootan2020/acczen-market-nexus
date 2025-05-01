
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactElement;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center px-4", className)}>
      {icon && (
        <div className="rounded-full p-4 bg-muted/20 mb-4">
          {React.cloneElement(icon, { className: cn("w-10 h-10 text-muted-foreground", icon.props.className) })}
        </div>
      )}
      <h3 className="mt-4 text-lg font-medium text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-md">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}


import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorMessageProps {
  message?: string;
  className?: string;
}

export function FormErrorMessage({ message, className }: FormErrorMessageProps) {
  if (!message) return null;
  
  return (
    <div className={cn("flex items-center gap-2 mt-2 text-destructive text-sm", className)}>
      <AlertTriangle className="h-3.5 w-3.5" />
      <p>{message}</p>
    </div>
  );
}

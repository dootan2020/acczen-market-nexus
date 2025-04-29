
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function Loading({ 
  size = 'md', 
  className, 
  text 
}: LoadingProps) {
  const spinnerSize = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <div 
        className={cn(
          "border-t-4 border-primary rounded-full animate-spin",
          spinnerSize[size]
        )}
        role="status" 
      />
      {text && <p className="text-muted-foreground text-sm">{text}</p>}
      <span className="sr-only">Đang tải...</span>
    </div>
  );
}

export default Loading;

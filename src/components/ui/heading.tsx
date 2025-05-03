
import React from "react";

interface HeadingProps {
  title: string;
  description?: string;
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({ 
  title, 
  description,
  className
}) => {
  return (
    <div className={className}>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
  );
};

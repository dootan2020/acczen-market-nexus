
import React from "react";

interface HeadingProps {
  title: string;
  description?: string;
  className?: string; // Added className prop
}

export const Heading: React.FC<HeadingProps> = ({ title, description, className }) => {
  return (
    <div className={`mb-6 ${className || ""}`}>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
    </div>
  );
};

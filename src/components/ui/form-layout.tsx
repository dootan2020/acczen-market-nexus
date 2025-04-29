
import React from "react";
import { cn } from "@/lib/utils";

interface FormLayoutProps {
  children: React.ReactNode;
  className?: string;
  stacked?: boolean;
}

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  stacked?: boolean;
}

interface FormLabelProps {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  required?: boolean;
}

interface FormInputProps {
  children: React.ReactNode;
  className?: string;
}

export const FormLayout: React.FC<FormLayoutProps> = ({ children, className, stacked = true }) => {
  return (
    <div className={cn("space-y-4", stacked ? "md:space-y-6" : "", className)}>
      {children}
    </div>
  );
};

export const FormGroup: React.FC<FormGroupProps> = ({ children, className, stacked = true }) => {
  return (
    <div className={cn(
      stacked ? "flex flex-col space-y-2" : "md:flex md:items-start md:space-x-4",
      className
    )}>
      {children}
    </div>
  );
};

export const FormLabel: React.FC<FormLabelProps> = ({ children, className, htmlFor, required }) => {
  return (
    <label 
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", 
        className
      )}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
};

export const FormInput: React.FC<FormInputProps> = ({ children, className }) => {
  return (
    <div className={cn("flex-1", className)}>
      {children}
    </div>
  );
};

export default FormLayout;


import React from 'react';
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Badge 
      className={`${
        status === 'completed' ? 'bg-green-600 text-white dark:bg-green-500' : 
        status === 'pending' ? 'bg-amber-500 text-white dark:bg-amber-400 dark:text-black' : 
        status === 'featured' ? 'bg-blue-600 text-white dark:bg-blue-500' : 
        'bg-gray-600 text-white dark:bg-gray-500'
      }`}
    >
      {formatStatus(status)}
    </Badge>
  );
};

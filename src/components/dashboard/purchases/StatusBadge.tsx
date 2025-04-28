
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
        status === 'completed' ? 'bg-green-100 text-green-800' : 
        status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
        'bg-gray-100 text-gray-800'
      }`}
    >
      {formatStatus(status)}
    </Badge>
  );
};


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface StockUpdateButtonProps {
  loading: boolean;
  isExpired: boolean;
  onUpdate: () => void;
}

const StockUpdateButton = ({ loading, isExpired, onUpdate }: StockUpdateButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={onUpdate}
      disabled={loading}
      title="Cập nhật tồn kho"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3 w-3 ${isExpired ? 'text-yellow-500' : ''}`}
        >
          <path d="M22 12c0 6-4.39 10-9.806 10C7.792 22 4.24 19.665 3 16" />
          <path d="M2 12C2 6 6.39 2 11.806 2 16.209 2 19.76 4.335 21 8" />
          <path d="M7 17l-4-1-1 4" />
          <path d="M17 7l4 1 1-4" />
        </svg>
      )}
    </Button>
  );
};

export default StockUpdateButton;

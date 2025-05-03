
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from '@/components/ui/button';

interface DepositsFilterProps {
  search: string;
  setSearch: (value: string) => void;
}

export const DepositsFilter: React.FC<DepositsFilterProps> = ({ search, setSearch }) => {
  const handleClearSearch = () => {
    setSearch('');
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search deposits by payment method or status..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {search && (
        <Button variant="outline" size="icon" onClick={handleClearSearch}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

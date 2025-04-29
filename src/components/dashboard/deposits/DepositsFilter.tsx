
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DepositsFilterProps {
  search: string;
  setSearch: (value: string) => void;
}

export function DepositsFilter({ search, setSearch }: DepositsFilterProps) {
  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          className="pl-10"
          placeholder="Search by transaction ID or payment method..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
}

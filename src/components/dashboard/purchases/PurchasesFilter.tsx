
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface PurchasesFilterProps {
  search: string;
  setSearch: (search: string) => void;
}

export const PurchasesFilter = ({ search, setSearch }: PurchasesFilterProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          className="pl-8 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Button
        variant="outline"
        onClick={() => setSearch("")}
        className="w-full sm:w-auto"
      >
        Clear
      </Button>
    </div>
  );
};

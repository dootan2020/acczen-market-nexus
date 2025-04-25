
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface DepositsFilterProps {
  search: string;
  setSearch: (search: string) => void;
}

export const DepositsFilter = ({ search, setSearch }: DepositsFilterProps) => {
  return (
    <div className="flex items-center mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search payment method, email or transaction hash..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Button
        variant="outline"
        onClick={() => setSearch("")}
        className="ml-2"
      >
        Clear
      </Button>
    </div>
  );
};

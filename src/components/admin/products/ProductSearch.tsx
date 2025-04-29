
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ProductSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ProductSearch({ searchQuery, onSearchChange }: ProductSearchProps) {
  return (
    <div className="mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          className="pl-10 w-full"
          placeholder="Search products by name, description, or slug..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}

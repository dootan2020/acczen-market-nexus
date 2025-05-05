
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: any[] | undefined;
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  onFilterReset: (key: string) => void;
  onFiltersClear: () => void;
  activeFiltersCount: number;
}

export function ProductFilters({
  searchQuery,
  onSearchChange,
  categories,
  filters,
  onFilterChange,
  onFilterReset,
  onFiltersClear,
  activeFiltersCount
}: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 1000
  ]);
  
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };
  
  const applyPriceRange = () => {
    onFilterChange('minPrice', priceRange[0]);
    onFilterChange('maxPrice', priceRange[1]);
  };
  
  const resetPriceRange = () => {
    setPriceRange([0, 1000]);
    onFilterReset('minPrice');
    onFilterReset('maxPrice');
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-10"
            placeholder="Search by name, description, SKU or slug..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex gap-2 items-center">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
            </SheetHeader>
            
            <div className="py-4 space-y-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="category">
                  <AccordionTrigger>Category</AccordionTrigger>
                  <AccordionContent>
                    <Select 
                      value={filters.category || ''}
                      onValueChange={(value) => onFilterChange('category', value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="status">
                  <AccordionTrigger>Status</AccordionTrigger>
                  <AccordionContent>
                    <Select 
                      value={filters.status || ''}
                      onValueChange={(value) => onFilterChange('status', value || undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="price">
                  <AccordionTrigger>Price Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-5">
                      <Slider
                        defaultValue={[0, 1000]}
                        max={1000}
                        step={10}
                        value={priceRange}
                        onValueChange={handlePriceRangeChange}
                      />
                      <div className="flex justify-between text-sm">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={applyPriceRange}
                        >
                          Apply
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1"
                          onClick={resetPriceRange}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="stock">
                  <AccordionTrigger>Stock</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="in-stock-filter">In Stock Only</Label>
                      <Switch 
                        id="in-stock-filter"
                        checked={filters.inStock === true}
                        onCheckedChange={(checked) => 
                          checked 
                            ? onFilterChange('inStock', true)
                            : onFilterReset('inStock')
                        }
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            <SheetFooter className="sm:justify-between">
              <Button 
                variant="outline" 
                onClick={onFiltersClear}
                disabled={activeFiltersCount === 0}
              >
                Clear Filters
              </Button>
              <SheetClose asChild>
                <Button>Done</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="secondary" className="flex gap-1 items-center">
              Category
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => onFilterReset('category')}
              >
                &times;
              </Button>
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="flex gap-1 items-center">
              Status: {filters.status}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => onFilterReset('status')}
              >
                &times;
              </Button>
            </Badge>
          )}
          {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
            <Badge variant="secondary" className="flex gap-1 items-center">
              Price: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => {
                  onFilterReset('minPrice');
                  onFilterReset('maxPrice');
                }}
              >
                &times;
              </Button>
            </Badge>
          )}
          {filters.inStock && (
            <Badge variant="secondary" className="flex gap-1 items-center">
              In Stock
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => onFilterReset('inStock')}
              >
                &times;
              </Button>
            </Badge>
          )}
          {activeFiltersCount > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2" 
              onClick={onFiltersClear}
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  );
}


import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubcategories } from "@/hooks/useSubcategories";
import { cn } from "@/lib/utils";

interface SubcategoryTabsProps {
  categoryId?: string;
  selectedSubcategory?: string;
  onSelectSubcategory: (subcategoryId: string) => void;
  className?: string;
}

export default function SubcategoryTabs({
  categoryId,
  selectedSubcategory,
  onSelectSubcategory,
  className,
}: SubcategoryTabsProps) {
  const { data: subcategories, isLoading } = useSubcategories(categoryId);

  if (isLoading || !subcategories?.length) {
    return null;
  }

  return (
    <Tabs
      value={selectedSubcategory || "all"}
      onValueChange={onSelectSubcategory}
      className={cn("w-full", className)}
    >
      <TabsList className="w-full overflow-x-auto flex flex-nowrap">
        <TabsTrigger value="all">All</TabsTrigger>
        {subcategories.map((subcategory) => (
          <TabsTrigger key={subcategory.id} value={subcategory.id} className="whitespace-nowrap">
            {subcategory.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

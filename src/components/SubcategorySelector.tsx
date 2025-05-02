
import { useSubcategories } from "@/hooks/useSubcategories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SubcategorySelectorProps {
  categoryId?: string;
  value?: string;
  onValueChange: (value: string) => void;
}

export default function SubcategorySelector({
  categoryId,
  value,
  onValueChange,
}: SubcategorySelectorProps) {
  const { data: subcategories, isLoading } = useSubcategories(categoryId);

  if (!categoryId) {
    return null;
  }

  return (
    <Select value={value || "none"} onValueChange={onValueChange}>
      <SelectTrigger disabled={isLoading}>
        <SelectValue placeholder="Select subcategory" />
      </SelectTrigger>
      <SelectContent>
        {!subcategories || subcategories.length === 0 ? (
          <SelectItem value="none">No subcategories available</SelectItem>
        ) : (
          subcategories.map((subcategory) => (
            <SelectItem key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

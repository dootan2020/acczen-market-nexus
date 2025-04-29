
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
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger disabled={isLoading}>
        <SelectValue placeholder="Select subcategory" />
      </SelectTrigger>
      <SelectContent>
        {subcategories?.map((subcategory) => (
          <SelectItem key={subcategory.id} value={subcategory.id || 'undefined'}>
            {subcategory.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

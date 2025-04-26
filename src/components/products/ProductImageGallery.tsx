
import { Badge } from "@/components/ui/badge";

interface ProductImageGalleryProps {
  imageUrl: string;
  name: string;
  salePrice?: number | null;
  categoryName?: string;
}

const ProductImageGallery = ({ imageUrl, name, salePrice, categoryName }: ProductImageGalleryProps) => {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-background">
      <img 
        src={imageUrl || 'https://placehold.co/600x400?text=No+Image'} 
        alt={name}
        className="w-full h-auto object-cover aspect-[4/3]"
      />
      {salePrice && (
        <Badge className="absolute top-4 left-4 bg-destructive hover:bg-destructive">
          Giảm giá
        </Badge>
      )}
      {categoryName && (
        <Badge className="absolute top-4 right-4 bg-secondary hover:bg-secondary">
          {categoryName}
        </Badge>
      )}
    </div>
  );
};

export default ProductImageGallery;

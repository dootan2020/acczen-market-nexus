
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from "@/components/ui/carousel";

interface ProductImageGalleryProps {
  imageUrl?: string;
  name?: string;
  salePrice?: number | null;
  categoryName?: string;
  images?: string[];
}

const ProductImageGallery = ({
  imageUrl,
  name = "Product",
  salePrice,
  categoryName,
  images = [],
}: ProductImageGalleryProps) => {
  const [favorited, setFavorited] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Combine main image with additional images
  const allImages = imageUrl ? [imageUrl, ...images] : images;

  // Use placeholder if no images available
  if (allImages.length === 0) {
    allImages.push('/placeholder.svg');
  }
  
  return (
    <div className="flex flex-col space-y-4">
      {/* Main Image with Gradient Background */}
      <div className="relative overflow-hidden rounded-lg border bg-background shadow-sm group">
        <div className="bg-gradient-to-r from-[#3498DB] to-[#2ECC71] aspect-[4/3] w-full flex items-center justify-center p-6">
          <img 
            src={allImages[activeImageIndex]} 
            alt={name}
            className="max-h-[300px] w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        
        {/* Product Badges - Moved to parent component for better control */}
        
        {/* Favorite Button */}
        <Button
          size="icon"
          variant="secondary"
          className={cn(
            "absolute top-4 right-4 h-8 w-8 rounded-full",
            favorited ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
          onClick={() => setFavorited(!favorited)}
        >
          <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
          <span className="sr-only">Add to favorites</span>
        </Button>
      </div>
      
      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <Carousel className="w-full max-w-xs mx-auto">
          <CarouselContent>
            {allImages.map((img, index) => (
              <CarouselItem key={index} className="basis-1/4 min-w-0">
                <div 
                  className={cn(
                    "h-16 cursor-pointer rounded border overflow-hidden transition-all",
                    activeImageIndex === index ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <div className="bg-gradient-to-r from-[#3498DB] to-[#2ECC71] h-full w-full flex items-center justify-center p-1">
                    <img 
                      src={img} 
                      alt={`${name} - view ${index + 1}`} 
                      className="h-full w-auto max-w-full object-contain"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <div className="flex justify-center gap-2 mt-2">
            <CarouselPrevious className="relative inset-0 translate-y-0 h-8 w-8" />
            <CarouselNext className="relative inset-0 translate-y-0 h-8 w-8" />
          </div>
        </Carousel>
      )}
    </div>
  );
};

export default ProductImageGallery;

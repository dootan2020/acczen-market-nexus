
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
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  
  // Combine main image with additional images
  const allImages = imageUrl ? [imageUrl, ...images.filter(img => img !== imageUrl)] : images;

  // Use placeholder if no images available
  if (allImages.length === 0) {
    allImages.push('/placeholder.svg');
  }

  // Handle mouse move for zoom effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    
    // Calculate relative position (0 to 1)
    const relativeX = (e.clientX - rect.left) / rect.width;
    const relativeY = (e.clientY - rect.top) / rect.height;
    
    // Adjust position to ensure the image doesn't leave the viewport
    setZoomPosition({
      x: Math.max(0, Math.min(100, relativeX * 100)),
      y: Math.max(0, Math.min(100, relativeY * 100)),
    });
  };
  
  return (
    <div className="flex flex-col space-y-4">
      {/* Main Image with Zoom Effect */}
      <div className="relative overflow-hidden rounded-lg bg-white">
        <div 
          className={cn(
            "cursor-zoom-in relative",
            isZoomed ? "overflow-hidden" : ""
          )}
          onClick={() => setIsZoomed(!isZoomed)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isZoomed && setIsZoomed(false)}
        >
          <AspectRatio ratio={1} className="bg-gradient-to-b from-gray-50 to-gray-100">
            <img 
              src={allImages[activeImageIndex]} 
              alt={name}
              className={cn(
                "w-full h-full object-contain transition-all duration-300 p-4",
                !isZoomed && "group-hover:scale-110"
              )}
            />
          </AspectRatio>
          
          {isZoomed && (
            <div className="absolute inset-0 bg-white">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${allImages[activeImageIndex]})`,
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: "200%",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </div>
          )}
        </div>
        
        {/* Favorite Button */}
        <Button
          size="icon"
          className={cn(
            "absolute top-4 right-4 h-10 w-10 rounded-full shadow-md transition-all duration-300",
            favorited 
              ? "bg-[#E74C3C]/90 text-white hover:bg-[#E74C3C]" 
              : "bg-white/90 text-gray-700 hover:bg-white"
          )}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering zoom
            setFavorited(!favorited);
          }}
        >
          <Heart 
            className={cn(
              "h-5 w-5 transition-all duration-300 hover:scale-110", 
              favorited && "fill-white"
            )} 
          />
          <span className="sr-only">Add to favorites</span>
        </Button>
      </div>
      
      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="px-4">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {allImages.map((img, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/4 sm:basis-1/5 md:basis-1/6">
                  <div 
                    className={cn(
                      "cursor-pointer rounded-md overflow-hidden transition-all border-2",
                      activeImageIndex === index ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-primary/50"
                    )}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <AspectRatio ratio={1}>
                      <div className="bg-gradient-to-b from-gray-50 to-gray-100 h-full w-full flex items-center justify-center p-1">
                        <img 
                          src={img} 
                          alt={`${name} - view ${index + 1}`} 
                          className="h-full w-auto max-w-full object-contain"
                        />
                      </div>
                    </AspectRatio>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <div className="flex justify-center gap-2 mt-2">
              <CarouselPrevious className="relative inset-0 translate-y-0 h-8 w-8 bg-white hover:bg-gray-50 border border-gray-200" />
              <CarouselNext className="relative inset-0 translate-y-0 h-8 w-8 bg-white hover:bg-gray-50 border border-gray-200" />
            </div>
          </Carousel>
        </div>
      )}
      
      {/* Image count indicator */}
      {allImages.length > 1 && (
        <div className="text-center text-sm text-gray-500">
          {activeImageIndex + 1} / {allImages.length}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;

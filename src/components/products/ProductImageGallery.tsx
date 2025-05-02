
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "sonner";

interface ProductImageGalleryProps {
  imageUrl?: string;
  name?: string;
  salePrice?: number | null;
  categoryName?: string;
  images?: string[]; // Array of image URLs
}

const ProductImageGallery = ({
  imageUrl,
  name = "Product",
  salePrice,
  categoryName,
  images = [], // Default to empty array
}: ProductImageGalleryProps) => {
  const [favorited, setFavorited] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Use provided images or fallback to main imageUrl
  const allImages = images.length > 0 ? images : imageUrl ? [imageUrl] : [];
  const activeImage = allImages.length > 0 ? allImages[activeImageIndex] : '/placeholder.svg';

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

  const handleFavoriteToggle = () => {
    setFavorited(!favorited);
    toast.success(favorited ? "Removed from favorites" : "Added to favorites");
  };
  
  return (
    <div className="flex flex-col space-y-4">
      {/* Main Image with Zoom Effect */}
      <div className="relative overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100">
        <div 
          className={cn(
            "cursor-zoom-in relative min-h-[400px]",
            isZoomed ? "overflow-hidden" : ""
          )}
          onClick={() => setIsZoomed(!isZoomed)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isZoomed && setIsZoomed(false)}
        >
          <AspectRatio ratio={1} className="bg-gradient-to-b from-slate-50 to-slate-100">
            <img 
              src={activeImage} 
              alt={name}
              className={cn(
                "w-full h-full object-contain transition-all duration-300 p-4",
                !isZoomed && "group-hover:scale-110"
              )}
            />
          </AspectRatio>
          
          {isZoomed && (
            <div className="absolute inset-0 bg-white z-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${activeImage})`,
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
            "absolute top-4 right-4 h-10 w-10 rounded-full shadow-sm transition-all duration-300 z-20",
            favorited 
              ? "bg-[#E74C3C]/90 text-white hover:bg-[#E74C3C]" 
              : "bg-white/90 text-gray-700 hover:bg-white"
          )}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering zoom
            handleFavoriteToggle();
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
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
          {allImages.map((image, index) => (
            <div 
              key={index}
              className={cn(
                "w-16 h-16 rounded border-2 cursor-pointer overflow-hidden transition-all",
                activeImageIndex === index 
                  ? "border-[#2ECC71]" 
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => setActiveImageIndex(index)}
            >
              <img 
                src={image} 
                alt={`${name} - View ${index + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;

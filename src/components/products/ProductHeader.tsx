
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ProductHeaderProps {
  name: string;
  slug?: string;
  categoryName?: string;
  categorySlug?: string;
  rating?: number;
  reviewCount?: number;
  stockQuantity?: number;
  soldCount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
}

const ProductHeader = ({ 
  name, 
  slug, 
  categoryName, 
  categorySlug,
  rating = 0, 
  reviewCount = 0,
  stockQuantity = 0,
  soldCount = 0,
  isNew = false,
  isFeatured = false,
  isBestSeller = false
}: ProductHeaderProps) => {
  const renderRating = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="fill-amber-400 text-amber-400 h-4 w-4" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="text-gray-300 h-4 w-4" />
            <div className="absolute top-0 left-0 overflow-hidden w-[50%]">
              <Star className="fill-amber-400 text-amber-400 h-4 w-4" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="text-gray-300 h-4 w-4" />);
      }
    }
    
    return stars;
  };

  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        {categoryName && categorySlug && (
          <Link to={`/category/${categorySlug}`} className="hover:text-[#2ECC71] transition-colors">
            {categoryName}
          </Link>
        )}
        {categoryName && (
          <>
            <span>/</span>
            <span className="text-gray-700">{name}</span>
          </>
        )}
      </div>
      
      {/* Product Title */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-3 font-sans text-gray-800">{name}</h1>
      
      {/* Status Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {isNew && (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">New</Badge>
        )}
        {isFeatured && (
          <Badge className="bg-[#19C37D] hover:bg-[#15a76b] text-white">Featured</Badge>
        )}
        {isBestSeller && (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Best Seller</Badge>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-y-3 sm:gap-x-6 text-sm">
        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center">
            <div className="flex mr-2">{renderRating()}</div>
            <span className="text-gray-600">
              {rating.toFixed(1)} ({reviewCount} reviews)
            </span>
          </div>
        )}
        
        {/* Stock Status */}
        {stockQuantity !== undefined && (
          <div className="flex items-center text-gray-600">
            <span className={`${stockQuantity > 0 ? 'text-green-600' : 'text-red-500'} font-medium`}>
              {stockQuantity > 0 ? `In stock: ${stockQuantity} items` : "Out of Stock"}
            </span>
            {soldCount > 0 && (
              <span className="ml-2">• Sold: {soldCount}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductHeader;

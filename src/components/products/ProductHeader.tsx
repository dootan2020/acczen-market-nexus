
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
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
      <h1 className="text-2xl sm:text-3xl font-bold font-poppins text-gray-800 mb-3">{name}</h1>
      
      <div className="flex flex-wrap items-center gap-3 mb-2">
        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center">
            <div className="flex mr-2">{renderRating()}</div>
            <span className="text-gray-600 text-sm">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}
        
        {/* Stock Status */}
        {stockQuantity !== undefined && (
          <div className="flex items-center text-sm">
            <span className={`${stockQuantity > 0 ? 'text-green-600' : 'text-red-500'} font-medium`}>
              {stockQuantity > 0 ? `In stock (${stockQuantity})` : "Out of Stock"}
            </span>
            {soldCount > 0 && stockQuantity > 0 && (
              <span className="mx-2 text-gray-400">|</span>
            )}
            {soldCount > 0 && (
              <span className="text-gray-500">{soldCount} sold</span>
            )}
          </div>
        )}
      </div>
      
      {/* Status Badges */}
      {(isNew || isFeatured || isBestSeller) && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {isNew && (
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-2.5 py-0.5">New</Badge>
          )}
          {isFeatured && (
            <Badge className="bg-[#19C37D] hover:bg-[#15a76b] text-white text-xs font-medium px-2.5 py-0.5">Featured</Badge>
          )}
          {isBestSeller && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-2.5 py-0.5">Best Seller</Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductHeader;

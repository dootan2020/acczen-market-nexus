
import { Star } from "lucide-react";

interface ProductHeaderProps {
  name: string;
  rating?: number;
  reviewCount?: number;
}

const ProductHeader = ({ name, rating = 0, reviewCount = 0 }: ProductHeaderProps) => {
  const renderRating = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="fill-yellow-400 text-yellow-400 h-4 w-4" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="text-muted-foreground h-4 w-4" />
            <div className="absolute top-0 left-0 overflow-hidden w-[50%]">
              <Star className="fill-yellow-400 text-yellow-400 h-4 w-4" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="text-muted-foreground h-4 w-4" />);
      }
    }
    
    return stars;
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">{name}</h1>
      
      {rating > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
          <div className="flex items-center gap-1">
            <div className="flex">{renderRating()}</div>
            <span className="text-sm text-muted-foreground">({reviewCount})</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductHeader;

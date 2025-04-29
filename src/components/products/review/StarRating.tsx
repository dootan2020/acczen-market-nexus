
import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  interactive?: boolean;
  size?: "small" | "medium" | "large";
}

export function StarRating({ 
  value, 
  onChange, 
  interactive = false, 
  size = "small" 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const starSize = {
    small: "h-4 w-4",
    medium: "h-5 w-5",
    large: "h-6 w-6"
  }[size];
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`
            ${starSize}
            ${interactive ? 'cursor-pointer' : ''}
            ${star <= (hoverRating || value) ? 'text-primary fill-primary' : 'text-muted-foreground'}
          `}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        />
      ))}
    </div>
  );
}

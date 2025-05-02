
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  value, 
  onChange, 
  interactive = false,
  size = 'md'
}) => {
  const totalStars = 5;
  
  const handleClick = (rating: number) => {
    if (interactive && onChange) {
      onChange(rating);
    }
  };
  
  const handleHover = (rating: number) => {
    // Add hover effects if needed
  };
  
  const getStarSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };
  
  return (
    <div className="flex">
      {Array.from({ length: totalStars }, (_, i) => i + 1).map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          onMouseEnter={() => handleHover(rating)}
          className={`${
            !interactive ? 'cursor-default' : 'cursor-pointer'
          } p-0 bg-transparent border-0`}
          tabIndex={interactive ? 0 : -1}
          aria-label={`${rating} star${rating !== 1 ? 's' : ''}`}
        >
          <Star
            className={`${getStarSize()} ${
              rating <= value
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};


import React from 'react';
import { ReviewsListProps } from './types';
import { ReviewItem } from './ReviewItem';

export const ReviewsList: React.FC<ReviewsListProps> = ({ reviews, onReviewUpdated }) => {
  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewItem 
          key={review.id} 
          review={review} 
          onReviewUpdated={onReviewUpdated} 
        />
      ))}
    </div>
  );
}

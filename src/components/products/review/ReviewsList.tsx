
import React from 'react';
import { ReviewItem } from './ReviewItem';
import { Review } from './types';
import { Loading } from '@/components/ui/loading';

interface ReviewsListProps {
  reviews: Review[];
  onReviewUpdated: () => void;
  isLoading?: boolean;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ 
  reviews, 
  onReviewUpdated,
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading text="Đang tải đánh giá..." />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này.</p>
        <p className="text-sm">Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <ReviewItem 
          key={review.id} 
          review={review} 
          onReviewUpdated={onReviewUpdated}
        />
      ))}
    </div>
  );
};

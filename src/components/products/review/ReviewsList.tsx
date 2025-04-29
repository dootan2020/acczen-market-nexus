
import { Review } from "./types";
import { ReviewItem } from "./ReviewItem";

interface ReviewsListProps {
  reviews: Review[];
  onReviewUpdated: () => void;
}

export function ReviewsList({ reviews, onReviewUpdated }: ReviewsListProps) {
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

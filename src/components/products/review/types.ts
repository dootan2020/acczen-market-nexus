
export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  helpful_count?: number;
  is_verified_purchase?: boolean;
  user?: {
    username: string;
    avatar_url: string | null;
  };
}

export interface ReviewItemProps {
  review: Review;
  onReviewUpdated?: () => void;
}

export interface ReviewsListProps {
  reviews: Review[];
  onReviewUpdated?: () => void;
}

export interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: (review: Review) => void;
}

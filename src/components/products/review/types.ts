
export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    username?: string;
    avatar_url?: string;
  };
  helpful_count?: number;
  is_verified_purchase?: boolean;
}

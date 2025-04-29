
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StarRating } from './review/StarRating';
import { ReviewForm } from './review/ReviewForm';
import { ReviewsList } from './review/ReviewsList';
import { Review } from './review/types';

interface ProductReviewsProps {
  productId: string;
  className?: string;
}

const ProductReviews = ({ productId, className }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Partial<Review>>({ rating: 0, comment: '' });
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);
  
  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          id, 
          user_id, 
          product_id, 
          rating, 
          comment, 
          created_at, 
          helpful_count,
          is_verified_purchase,
          user:profiles(username, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setReviews(data || []);
      
      // Calculate average rating
      if (data && data.length > 0) {
        const total = data.reduce((sum: number, review: Review) => sum + review.rating, 0);
        setAverageRating(total / data.length);
        setTotalReviews(data.length);
      }
      
      // Check if the current user has already reviewed this product
      if (user && data) {
        const hasReviewed = data.some((review: Review) => review.user_id === user.id);
        setUserHasReviewed(!!hasReviewed);
        
        if (hasReviewed) {
          const existingReview = data.find((review: Review) => review.user_id === user.id);
          if (existingReview) {
            setUserReview({
              id: existingReview.id,
              rating: existingReview.rating,
              comment: existingReview.comment
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Failed to load reviews",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    fetchReviews();
    setUserHasReviewed(true);
  };
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Customer Reviews
              </CardTitle>
              {!isLoading && (
                <CardDescription>
                  {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'} • {averageRating.toFixed(1)} average rating
                </CardDescription>
              )}
            </div>
            {!isLoading && totalReviews > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <StarRating value={averageRating} size="medium" />
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {user && !userHasReviewed && (
                <div className="mb-6">
                  <ReviewForm
                    productId={productId}
                    userReview={userReview as { rating: number, comment?: string }}
                    setUserReview={setUserReview}
                    onReviewSubmitted={handleReviewSubmitted}
                  />
                </div>
              )}
              
              {user && userHasReviewed && (
                <div className="mb-6">
                  <ReviewForm
                    productId={productId}
                    userReview={userReview as { id?: string, rating: number, comment?: string }}
                    setUserReview={setUserReview}
                    onReviewSubmitted={handleReviewSubmitted}
                    isEditing={true}
                  />
                </div>
              )}
              
              <ReviewsList 
                reviews={reviews} 
                onReviewUpdated={fetchReviews} 
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductReviews;

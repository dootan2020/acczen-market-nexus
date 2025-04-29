
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ReviewForm } from './review/ReviewForm';
import { ReviewsList } from './review/ReviewsList';
import { Review } from './review/types';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
    
    if (user) {
      checkUserReview();
    }
  }, [productId, user]);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First get all reviews for the product
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('product_reviews')
        .select(`
          id, 
          user_id, 
          product_id, 
          rating, 
          comment, 
          created_at, 
          helpful_count, 
          is_verified_purchase
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      
      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        setError('Không thể tải đánh giá sản phẩm. Vui lòng thử lại sau.');
        setIsLoading(false);
        return;
      }
      
      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        setIsLoading(false);
        return;
      }
      
      // Then get the profile information for all users who left reviews
      const reviewsWithProfiles = await Promise.all(
        reviewsData.map(async (review) => {
          try {
            // Get profile information for each review's user_id
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', review.user_id)
              .single();
            
            // Return the review with the associated user profile data
            return {
              ...review,
              user: {
                username: profileData?.username || 'Người dùng ẩn danh',
                avatar_url: profileData?.avatar_url || null,
              }
            };
          } catch (err) {
            console.error('Error fetching profile for review:', err);
            // Return the review with default user info if profile fetch fails
            return {
              ...review,
              user: {
                username: 'Người dùng ẩn danh',
                avatar_url: null,
              }
            };
          }
        })
      );
      
      setReviews(reviewsWithProfiles);
    } catch (error) {
      console.error('Error in fetchReviews:', error);
      setError('Đã xảy ra lỗi khi tải đánh giá. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserReview = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select()
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking user review:', error);
        return;
      }
      
      setUserHasReviewed(!!data);
    } catch (error) {
      console.error('Error in checkUserReview:', error);
    }
  };

  const handleReviewSubmitted = (newReview: Review) => {
    setReviews([newReview, ...reviews]);
    setUserHasReviewed(true);
    setShowForm(false);
    toast({
      title: "Đánh giá đã được gửi",
      description: "Cảm ơn bạn đã chia sẻ ý kiến của mình!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Đánh giá từ khách hàng</h2>
        {user && !userHasReviewed && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Hủy' : 'Viết đánh giá'}
          </Button>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {showForm && (
        <ReviewForm 
          productId={productId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      <ReviewsList 
        reviews={reviews} 
        onReviewUpdated={fetchReviews}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProductReviews;


import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ReviewForm } from './review/ReviewForm';
import { ReviewsList } from './review/ReviewsList';
import { Review } from './review/types';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
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
    try {
      // Modified query to correctly join with profiles table
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our Review type structure
      const reviewsWithProfiles = data.map(review => ({
        ...review,
        user: {
          username: review.profiles?.username || 'Anonymous',
          avatar_url: review.profiles?.avatar_url || null,
        }
      }));
      
      setReviews(reviewsWithProfiles);
    } catch (error) {
      console.error('Error fetching reviews:', error);
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
      
      if (error) throw error;
      
      setUserHasReviewed(!!data);
    } catch (error) {
      console.error('Error checking user review:', error);
    }
  };

  const handleReviewSubmitted = (newReview: Review) => {
    setReviews([newReview, ...reviews]);
    setUserHasReviewed(true);
    setShowForm(false);
    toast({
      title: "Review submitted",
      description: "Thank you for your feedback!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        {user && !userHasReviewed && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Write a Review'}
          </Button>
        )}
      </div>
      
      {showForm && (
        <ReviewForm 
          productId={productId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      <ReviewsList 
        reviews={reviews} 
        onReviewUpdated={fetchReviews} 
      />
    </div>
  );
};

export default ProductReviews;

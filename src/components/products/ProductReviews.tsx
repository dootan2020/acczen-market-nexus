
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
      
      if (reviewsError) throw reviewsError;
      
      if (!reviewsData) {
        setReviews([]);
        setIsLoading(false);
        return;
      }
      
      // Then get the profile information for all users who left reviews
      const reviewsWithProfiles = await Promise.all(
        reviewsData.map(async (review) => {
          // Get profile information for each review's user_id
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', review.user_id)
            .maybeSingle();
          
          // Return the review with the associated user profile data
          return {
            ...review,
            user: {
              username: profileData?.username || 'Anonymous',
              avatar_url: profileData?.avatar_url || null,
            }
          } as Review;
        })
      );
      
      setReviews(reviewsWithProfiles);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error loading reviews",
        description: "Couldn't load product reviews. Please try again later.",
        variant: "destructive",
      });
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

      {isLoading ? (
        <div className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <ReviewsList 
          reviews={reviews} 
          onReviewUpdated={fetchReviews} 
        />
      )}
    </div>
  );
};

export default ProductReviews;

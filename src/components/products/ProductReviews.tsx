
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, User, MessageSquare, ThumbsUp, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Review {
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

interface ProductReviewsProps {
  productId: string;
  className?: string;
}

const StarRating = ({ 
  value, 
  onChange, 
  interactive = false, 
  size = "small" 
}: { 
  value: number; 
  onChange?: (rating: number) => void;
  interactive?: boolean;
  size?: "small" | "medium" | "large";
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const starSize = {
    small: "h-4 w-4",
    medium: "h-5 w-5",
    large: "h-6 w-6"
  }[size];
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`
            ${starSize}
            ${interactive ? 'cursor-pointer' : ''}
            ${star <= (hoverRating || value) ? 'text-primary fill-primary' : 'text-muted-foreground'}
          `}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        />
      ))}
    </div>
  );
};

const ProductReviews = ({ productId, className }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Partial<Review>>({ rating: 0, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchReviews();
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
        const total = data.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating(total / data.length);
        setTotalReviews(data.length);
      }
      
      // Check if the current user has already reviewed this product
      if (user) {
        const hasReviewed = data?.some(review => review.user_id === user.id);
        setUserHasReviewed(!!hasReviewed);
        
        if (hasReviewed) {
          const existingReview = data?.find(review => review.user_id === user.id);
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
  
  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to leave a review",
        variant: "destructive",
      });
      return;
    }
    
    if (userReview.rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if user has purchased this product
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('order_items')
        .select('id')
        .eq('product_id', productId)
        .eq('order:orders(user_id)', user.id)
        .limit(1);
        
      const isVerifiedPurchase = purchaseData && purchaseData.length > 0;
      
      if (userHasReviewed && userReview.id) {
        // Update existing review
        const { error } = await supabase
          .from('product_reviews')
          .update({
            rating: userReview.rating,
            comment: userReview.comment,
            updated_at: new Date().toISOString()
          })
          .eq('id', userReview.id);
          
        if (error) throw error;
        
        toast({
          title: "Review updated",
          description: "Thank you for updating your review",
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from('product_reviews')
          .insert({
            user_id: user.id,
            product_id: productId,
            rating: userReview.rating,
            comment: userReview.comment,
            is_verified_purchase: isVerifiedPurchase
          });
          
        if (error) throw error;
        
        toast({
          title: "Review submitted",
          description: "Thank you for sharing your feedback",
        });
        
        setUserHasReviewed(true);
      }
      
      // Refresh reviews
      fetchReviews();
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Failed to submit review",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleHelpful = async (reviewId: string, currentCount = 0) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to mark reviews as helpful",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ helpful_count: currentCount + 1 })
        .eq('id', reviewId);
        
      if (error) throw error;
      
      // Update local state
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, helpful_count: (review.helpful_count || 0) + 1 } 
          : review
      ));
      
      toast({
        title: "Marked as helpful",
        description: "Thank you for your feedback",
      });
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };
  
  const handleReportReview = async (reviewId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to report reviews",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // In a real application, you would insert a record into a reports table
      toast({
        title: "Review reported",
        description: "Our moderators will review this content",
      });
    } catch (error) {
      console.error('Error reporting review:', error);
    }
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
                <div className="mb-6 p-4 border rounded-md bg-muted/30">
                  <h3 className="font-medium mb-2">Write a Review</h3>
                  <div className="mb-3">
                    <label className="block text-sm mb-1">Your Rating</label>
                    <StarRating 
                      value={userReview.rating || 0} 
                      onChange={rating => setUserReview(prev => ({ ...prev, rating }))} 
                      interactive 
                      size="medium"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm mb-1">Your Review</label>
                    <Textarea 
                      value={userReview.comment || ''} 
                      onChange={e => setUserReview(prev => ({ ...prev, comment: e.target.value }))} 
                      placeholder="Share your experience with this product..." 
                      rows={3} 
                    />
                  </div>
                  <Button 
                    onClick={handleSubmitReview} 
                    disabled={isSubmitting || userReview.rating === 0}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              )}
              
              {user && userHasReviewed && (
                <div className="mb-6 p-4 border rounded-md bg-muted/30">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Your Review</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setUserHasReviewed(false)}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="mb-2">
                    <StarRating value={userReview.rating || 0} size="medium" />
                  </div>
                  <p className="text-sm">{userReview.comment}</p>
                </div>
              )}
              
              {reviews.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-4 border-b last:border-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {review.user?.avatar_url ? (
                              <AvatarImage src={review.user.avatar_url} alt={review.user?.username || 'User'} />
                            ) : (
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{review.user?.username || 'Anonymous User'}</p>
                              {review.is_verified_purchase && (
                                <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <StarRating value={review.rating} />
                              <span className="ml-2 text-xs">
                                {formatDate(review.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 ml-11">
                        <p className="text-sm">{review.comment}</p>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-xs"
                            onClick={() => handleHelpful(review.id, review.helpful_count)}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Helpful {review.helpful_count ? `(${review.helpful_count})` : ''}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-xs"
                            onClick={() => handleReportReview(review.id)}
                          >
                            <Flag className="h-3 w-3 mr-1" />
                            Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductReviews;


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./StarRating";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ReviewFormProps {
  productId: string;
  userReview: {
    id?: string;
    rating: number;
    comment?: string;
  };
  setUserReview: React.Dispatch<React.SetStateAction<{
    id?: string;
    rating: number;
    comment?: string;
  }>>;
  onReviewSubmitted: () => void;
  isEditing?: boolean;
}

export function ReviewForm({ 
  productId, 
  userReview, 
  setUserReview, 
  onReviewSubmitted,
  isEditing = false
}: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
      const { data: purchaseData } = await supabase
        .from('order_items')
        .select('id')
        .eq('product_id', productId)
        .eq('order:orders(user_id)', user.id)
        .limit(1);
        
      const isVerifiedPurchase = purchaseData && purchaseData.length > 0;
      
      if (isEditing && userReview.id) {
        // Update existing review
        const { error } = await supabase
          .from('product_reviews')
          .update({
            rating: userReview.rating,
            comment: userReview.comment
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
      }
      
      // Notify parent component that review was submitted
      onReviewSubmitted();
      
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

  return (
    <div className="p-4 border rounded-md bg-muted/30">
      {isEditing ? (
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Edit Your Review</h3>
        </div>
      ) : (
        <h3 className="font-medium mb-2">Write a Review</h3>
      )}
      
      <div className="mb-3">
        <label className="block text-sm mb-1">Your Rating</label>
        <StarRating 
          value={userReview.rating} 
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
        {isSubmitting ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
      </Button>
    </div>
  );
}

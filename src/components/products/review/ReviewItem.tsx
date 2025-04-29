
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, ThumbsUp, Flag } from "lucide-react";
import { StarRating } from "./StarRating";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Review } from "./types";

interface ReviewItemProps {
  review: Review;
  onReviewUpdated: () => void;
}

export function ReviewItem({ review, onReviewUpdated }: ReviewItemProps) {
  const { toast } = useToast();
  const { user } = useAuth();

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
      
      toast({
        title: "Marked as helpful",
        description: "Thank you for your feedback",
      });
      
      onReviewUpdated();
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
    <div className="pb-4 border-b last:border-0">
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
  );
}

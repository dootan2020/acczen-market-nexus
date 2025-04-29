
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: (review: any) => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to submit a review');
      return;
    }
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      
      const reviewData = {
        product_id: productId,
        user_id: user.id,
        rating,
        comment: comment.trim(),
      };
      
      const { data, error } = await supabase
        .from('product_reviews')
        .insert(reviewData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add profile info to the returned review for UI
      const reviewWithProfile = {
        ...data,
        username: profile?.username || 'Anonymous',
        avatar_url: profile?.avatar_url || null,
      };
      
      onReviewSubmitted(reviewWithProfile);
      setRating(0);
      setComment('');
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-card border rounded-lg">
      <h3 className="font-medium text-lg">Write Your Review</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">Rating</label>
        <StarRating rating={rating} onRatingChange={setRating} editable />
      </div>
      
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-1">Your Review</label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this product..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};

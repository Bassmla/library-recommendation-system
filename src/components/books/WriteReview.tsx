import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Review } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { createReview } from '@/services/api';
import { handleApiError, showSuccess } from '@/utils/errorHandling';

/**
 * WriteReview component props
 */
interface WriteReviewProps {
  bookId: string;
  bookTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewCreated: (review: Review) => void;
}

/**
 * Modal component for writing a new review
 */
export function WriteReview({ bookId, bookTitle, isOpen, onClose, onReviewCreated }: WriteReviewProps) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      alert('Please log in to write a review');
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      alert('Please write a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReview = await createReview(bookId, rating, comment);
      onReviewCreated(newReview);
      showSuccess('Review submitted successfully!');
      
      // Reset form
      setRating(0);
      setComment('');
      onClose();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="cursor-pointer hover:scale-110 transition-transform"
          >
            <svg
              className={`w-8 h-8 ${
                star <= currentRating ? 'text-amber-400 fill-current' : 'text-gray-300'
              } hover:text-amber-300`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        <span className="ml-3 text-sm text-slate-600">
          {rating > 0 ? `${rating} out of 5 stars` : 'Click to rate'}
        </span>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Write a Review">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            How would you rate "{bookTitle}"?
          </h3>
          <p className="text-slate-600 text-sm">
            Share your thoughts to help other readers discover great books
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Your Rating
            </label>
            <div className="flex justify-center">
              {renderStars(rating, setRating)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of this book? Share your thoughts, favorite moments, or what other readers should know..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[150px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-slate-500">
                {comment.length}/500 characters
              </p>
              {comment.length > 450 && (
                <p className="text-xs text-amber-600">
                  {500 - comment.length} characters remaining
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Review Guidelines</h4>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Be honest and constructive in your feedback</li>
                <li>• Avoid spoilers - let others discover the story</li>
                <li>• Focus on your reading experience</li>
                <li>• Reviews are public and help other readers</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || !comment.trim()}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
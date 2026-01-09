import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Review } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { updateReview, deleteReview } from '@/services/api';
import { handleApiError, showSuccess } from '@/utils/errorHandling';
import { formatDate } from '@/utils/formatters';

/**
 * ReviewCard component props
 */
interface ReviewCardProps {
  review: Review;
  onReviewUpdated: (updatedReview: Review) => void;
  onReviewDeleted: (reviewId: string) => void;
}

/**
 * Individual review card component
 */
export function ReviewCard({ review, onReviewUpdated, onReviewDeleted }: ReviewCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnReview = isAuthenticated && user?.id === review.userId;

  const handleUpdateReview = async () => {
    if (!editComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    setIsUpdating(true);
    try {
      const updatedReview = await updateReview(review.id, editRating, editComment);
      onReviewUpdated(updatedReview);
      setIsEditing(false);
      showSuccess('Review updated successfully!');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteReview = async () => {
    setIsDeleting(true);
    try {
      await deleteReview(review.id);
      onReviewDeleted(review.id);
      setShowDeleteConfirm(false);
      showSuccess('Review deleted successfully!');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange?.(star)}
            disabled={!interactive}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } transition-transform`}
          >
            <svg
              className={`w-5 h-5 ${
                star <= rating ? 'text-amber-400 fill-current' : 'text-gray-300'
              }`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="glass-effect rounded-xl border border-white/20 p-6 hover-glow transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {review.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">{review.userName}</h4>
              <p className="text-sm text-slate-500">{formatDate(review.createdAt)}</p>
            </div>
          </div>
          
          {isOwnReview && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-slate-500 hover:text-violet-600 transition-colors p-1"
                title="Edit review"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-slate-500 hover:text-red-600 transition-colors p-1"
                title="Delete review"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="mb-3">
          {renderStars(review.rating)}
        </div>

        <p className="text-slate-700 leading-relaxed">{review.comment}</p>
      </div>

      {/* Edit Review Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Review"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Rating
            </label>
            {renderStars(editRating, true, setEditRating)}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Comment
            </label>
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="Share your thoughts about this book..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-slate-500 mt-1">
              {editComment.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsEditing(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateReview}
              disabled={isUpdating || !editComment.trim()}
            >
              {isUpdating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update Review'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Review"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Are you sure?</h3>
              <p className="text-slate-600">
                This will permanently delete your review. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteReview}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Review'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
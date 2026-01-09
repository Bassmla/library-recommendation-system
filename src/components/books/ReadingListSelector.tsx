import { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getReadingLists, addBookToReadingList } from '@/services/api';
import { ReadingList } from '@/types';
import { handleApiError, showSuccess } from '@/utils/errorHandling';

/**
 * ReadingListSelector component props
 */
interface ReadingListSelectorProps {
  bookId: string;
  bookTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component for selecting a reading list to add a book to
 */
export function ReadingListSelector({ bookId, bookTitle, isOpen, onClose }: ReadingListSelectorProps) {
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadReadingLists();
    }
  }, [isOpen]);

  const loadReadingLists = async () => {
    setIsLoading(true);
    try {
      const lists = await getReadingLists();
      setReadingLists(lists);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToList = async (listId: string, listName: string) => {
    setIsAdding(listId);
    try {
      await addBookToReadingList(listId, bookId);
      showSuccess(`"${bookTitle}" added to "${listName}"!`);
      onClose();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Reading List">
      <div className="space-y-4">
        <p className="text-slate-600">
          Select a reading list to add <strong>"{bookTitle}"</strong> to:
        </p>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : readingLists.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-violet-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Reading Lists</h3>
            <p className="text-slate-600 mb-4">
              You don't have any reading lists yet. Create one first!
            </p>
            <Button variant="primary" onClick={onClose}>
              Go to Reading Lists
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {readingLists.map((list) => {
              const isBookInList = list.bookIds?.includes(bookId);
              const isCurrentlyAdding = isAdding === list.id;

              return (
                <div
                  key={list.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-violet-300 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{list.name}</h4>
                    <p className="text-sm text-slate-600">
                      {list.bookIds?.length || 0} books
                    </p>
                  </div>
                  
                  {isBookInList ? (
                    <div className="flex items-center text-green-600">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium">Already added</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddToList(list.id, list.name)}
                      disabled={isCurrentlyAdding}
                    >
                      {isCurrentlyAdding ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Adding...
                        </>
                      ) : (
                        'Add to List'
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
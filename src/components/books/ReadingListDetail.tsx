import { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BookGrid } from '@/components/books/BookGrid';
import { getBook, removeBookFromReadingList, deleteReadingList } from '@/services/api';
import { ReadingList, Book } from '@/types';
import { handleApiError, showSuccess } from '@/utils/errorHandling';
import { formatDate } from '@/utils/formatters';

/**
 * ReadingListDetail component props
 */
interface ReadingListDetailProps {
  readingList: ReadingList;
  isOpen: boolean;
  onClose: () => void;
  onListUpdated: (updatedList: ReadingList) => void;
  onListDeleted: (listId: string) => void;
}

/**
 * Modal component for viewing and managing a reading list
 */
export function ReadingListDetail({ 
  readingList, 
  isOpen, 
  onClose, 
  onListUpdated, 
  onListDeleted 
}: ReadingListDetailProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && readingList.bookIds?.length > 0) {
      loadBooks();
    } else if (isOpen) {
      setBooks([]);
    }
  }, [isOpen, readingList.bookIds]);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const bookPromises = readingList.bookIds.map(bookId => getBook(bookId));
      const bookResults = await Promise.all(bookPromises);
      const validBooks = bookResults.filter((book): book is Book => book !== null);
      setBooks(validBooks);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBook = async (bookId: string, bookTitle: string) => {
    setIsRemoving(bookId);
    try {
      const updatedList = await removeBookFromReadingList(readingList.id, bookId);
      onListUpdated(updatedList);
      setBooks(books.filter(book => book.id !== bookId));
      showSuccess(`"${bookTitle}" removed from reading list!`);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleDeleteList = async () => {
    setIsDeleting(true);
    try {
      await deleteReadingList(readingList.id);
      onListDeleted(readingList.id);
      showSuccess(`Reading list "${readingList.name}" deleted successfully!`);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={readingList.name}
        size="large"
      >
        <div className="space-y-6">
          {/* Reading List Info */}
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{readingList.name}</h2>
                {readingList.description && (
                  <p className="text-slate-600 mb-3">{readingList.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>{readingList.bookIds?.length || 0} books</span>
                  <span>Created {formatDate(readingList.createdAt)}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete List
              </Button>
            </div>
          </div>

          {/* Books */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Books Yet</h3>
              <p className="text-slate-600">
                This reading list is empty. Add some books to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Books in this list</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {books.map((book) => (
                  <div key={book.id} className="relative group">
                    <div className="glass-effect rounded-xl overflow-hidden border border-white/20">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Cover';
                        }}
                      />
                      <div className="p-4">
                        <h4 className="font-semibold text-slate-900 mb-1 line-clamp-2">{book.title}</h4>
                        <p className="text-sm text-slate-600 mb-3">{book.author}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveBook(book.id, book.title)}
                          disabled={isRemoving === book.id}
                          className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        >
                          {isRemoving === book.id ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Removing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Remove
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Reading List"
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
                This will permanently delete the reading list "{readingList.name}" and remove all {readingList.bookIds?.length || 0} books from it.
              </p>
            </div>
          </div>
          
          <p className="text-sm text-slate-500">
            This action cannot be undone.
          </p>

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
              onClick={handleDeleteList}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Reading List'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
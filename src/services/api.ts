import { Book, ReadingList, Recommendation } from '@/types';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function getAuthHeaders() {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch {
    return {
      'Content-Type': 'application/json',
    };
  }
}

export async function getBooks(): Promise<Book[]> {
  const response = await fetch(`${API_BASE_URL}/books`);
  if (!response.ok) throw new Error('Failed to fetch books');
  return response.json();
}

export async function getBook(id: string): Promise<Book | null> {
  const response = await fetch(`${API_BASE_URL}/books/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Failed to fetch book');
  return response.json();
}

export async function createBook(book: Omit<Book, 'id'>): Promise<Book> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/books`, {
    method: 'POST',
    headers,
    body: JSON.stringify(book) 
  });
  if (!response.ok) {
    throw new Error('Failed to create book');
  }
  return response.json();
}

/**
 * Update an existing book (admin only)
 * TODO: Replace with PUT /books/:id API call
 */
export async function updateBook(id: string, book: Partial<Book>): Promise<Book> {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const existingBook = mockBooks.find((b) => b.id === id);
      const updatedBook: Book = {
        ...existingBook!,
        ...book,
        id,
      };
      resolve(updatedBook);
    }, 500);
  });
}

/**
 * Delete a book (admin only)
 * TODO: Replace with DELETE /books/:id API call
 */
export async function deleteBook(): Promise<void> {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 300);
  });
}

export async function getRecommendations(query: string): Promise<Recommendation[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/recommendations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error('Failed to get recommendations');
  const data = await response.json();
  return data.recommendations;
}

export async function getReadingLists(): Promise<ReadingList[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/reading-lists`, {
    headers,
  });
  if (!response.ok) {
    throw new Error('Failed to fetch reading lists');
  }
  return response.json();
}

export async function createReadingList(
  list: Omit<ReadingList, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ReadingList> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/reading-lists`, {
    method: 'POST',
    headers,
    body: JSON.stringify(list),
  });
  if (!response.ok) throw new Error('Failed to create reading list');
  return response.json();
}

export async function updateReadingList(
  id: string,
  list: Partial<ReadingList>
): Promise<ReadingList> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/reading-lists/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(list),
  });

  if (!response.ok) {
    throw new Error('Failed to update reading list');
  }

  return response.json();
}

export async function deleteReadingList(id: string): Promise<void> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/reading-lists/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to delete reading list');
  }
}

import { Book, ReadingList, Review, Recommendation } from '@/types';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
  } catch {
    // Fall through to return basic headers
  }
  
  return {
    'Content-Type': 'application/json',
  };
}

export async function getBooks(): Promise<Book[]> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/books`, {
    headers,
  });

  if (!response.ok) throw new Error('Failed to fetch books');
  return response.json();
}


export async function getBook(id: string): Promise<Book | null> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/books/${id}`, {
    headers,
  });

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

export async function updateBook(
  id: string,
  book: Partial<Book>
): Promise<Book> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/books/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    throw new Error('Failed to update book');
  }

  return response.json();
}

export async function deleteBook(id: string): Promise<void> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/books/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to delete book');
  }
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
    headers
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
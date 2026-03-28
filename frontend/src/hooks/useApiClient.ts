import { useCallback } from 'react';
import { ChatApiResponse, DashboardStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * A custom hook to interact with the backend API.
 * Provides memoized functions for API calls.
 */
const useApiClient = () => {
  /**
   * Sends a chat message to the backend.
   * @param message The user's message.
   * @param language The selected language ('en' or 'es').
   * @param sessionId The unique session identifier.
   * @returns A promise that resolves to the API response.
   */
  const postChatMessage = useCallback(
    async (
      message: string,
      language: string,
      sessionId: string
    ): Promise<ChatApiResponse> => {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, language, sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown network error occurred.' }));
        throw new Error(errorData.message || 'Failed to send message to the server.');
      }

      return response.json();
    },
    []
  );

  /**
   * Fetches dashboard statistics from the backend.
   * @returns A promise that resolves to the dashboard statistics.
   */
  const getDashboardStats = useCallback(async (): Promise<DashboardStats> => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown network error occurred.' }));
      throw new Error(errorData.message || 'Failed to fetch dashboard statistics.');
    }

    return response.json();
  }, []);

  return { postChatMessage, getDashboardStats };
};

export default useApiClient;
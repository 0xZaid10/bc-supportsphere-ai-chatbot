import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatbotWidget from '../components/ChatbotWidget';
import ChatProvider from '../context/ChatContext';
import LanguageProvider from '../context/LanguageContext';
import useApiClient from '../hooks/useApiClient';

// Mock the useApiClient hook
vi.mock('../hooks/useApiClient');

// Mock the i18n setup
vi.mock('../i18n', () => ({
  t: (key: string) => {
    const translations: { [key: string]: string } = {
      'chatbot.welcome': 'Welcome to AI Support! How can I help you today?',
      'chatbot.inputPlaceholder': 'Type your message...',
      'chatbot.send': 'Send',
      'chatbot.errorMessage': 'Sorry, something went wrong. Please try again later.',
    };
    return translations[key] || key;
  },
}));

// Mock uuid to have a predictable session ID
vi.mock('uuid', () => ({
  v4: () => 'mock-session-id-123',
}));

describe('ChatbotWidget', () => {
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useApiClient as jest.Mock).mockReturnValue({
      post: mockPost,
      loading: false,
      error: null,
    });
  });

  const renderWithProviders = () => {
    return render(
      <LanguageProvider>
        <ChatProvider>
          <ChatbotWidget />
        </ChatProvider>
      </LanguageProvider>
    );
  };

  it('renders the initial state correctly', () => {
    renderWithProviders();
    expect(screen.getByText('Welcome to AI Support! How can I help you today?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('allows the user to type a message', () => {
    renderWithProviders();
    const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Hello there' } });
    expect(input.value).toBe('Hello there');
  });

  it('sends a message and displays the response on successful API call', async () => {
    const mockResponse = {
      response: 'Hello! How can I assist you?',
      classification: 'general_question',
      ticketId: null,
    };
    mockPost.mockResolvedValue(mockResponse);

    renderWithProviders();

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    // User types and sends a message
    fireEvent.change(input, { target: { value: 'My internet is down' } });
    fireEvent.click(sendButton);

    // Check if the user's message is displayed
    await waitFor(() => {
      expect(screen.getByText('My internet is down')).toBeInTheDocument();
    });

    // Check if the API was called correctly
    expect(mockPost).toHaveBeenCalledWith('/api/chat', {
      message: 'My internet is down',
      language: 'en',
      sessionId: 'mock-session-id-123',
    });

    // Check if the bot's response is displayed
    await waitFor(() => {
      expect(screen.getByText('Hello! How can I assist you?')).toBeInTheDocument();
    });

    // Check if the input is cleared
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('displays an error message on API failure', async () => {
    mockPost.mockRejectedValue(new Error('API Error'));

    renderWithProviders();

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    fireEvent.change(input, { target: { value: 'This will fail' } });
    fireEvent.click(sendButton);

    // Check for user message
    await waitFor(() => {
      expect(screen.getByText('This will fail')).toBeInTheDocument();
    });

    // Check for the error message from the bot
    await waitFor(() => {
      expect(screen.getByText('Sorry, something went wrong. Please try again later.')).toBeInTheDocument();
    });
  });

  it('disables the input and button while waiting for a response', async () => {
    // A promise that we can resolve manually to simulate loading
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockPost.mockReturnValue(promise);

    renderWithProviders();

    const input = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
    const sendButton = screen.getByRole('button', { name: 'Send' }) as HTMLButtonElement;

    fireEvent.change(input, { target: { value: 'A long request' } });
    fireEvent.click(sendButton);

    // Immediately after sending, input and button should be disabled
    await waitFor(() => {
      expect(input.disabled).toBe(true);
      expect(sendButton.disabled).toBe(true);
    });

    // Resolve the promise to simulate the API call finishing
    resolvePromise!({ response: 'Finally, an answer!', classification: 'general_question', ticketId: null });

    // After the response, input and button should be enabled again
    await waitFor(() => {
      expect(screen.getByText('Finally, an answer!')).toBeInTheDocument();
      expect(input.disabled).toBe(false);
      expect(sendButton.disabled).toBe(false);
    });
  });

  it('does not send an empty message', () => {
    renderWithProviders();
    const sendButton = screen.getByRole('button', { name: 'Send' });
    fireEvent.click(sendButton);
    expect(mockPost).not.toHaveBeenCalled();
  });
});
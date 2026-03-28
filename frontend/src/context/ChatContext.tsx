import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Message } from '../types';
import { useApiClient } from '../hooks/useApiClient';
import { useLanguage } from './LanguageContext';

interface ChatContextType {
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  sessionId: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

const initialMessages: { [key: string]: Message[] } = {
  en: [{ id: 'initial-en', text: 'Hello! How can I assist you today?', sender: 'bot' }],
  es: [{ id: 'initial-es', text: '¡Hola! ¿Cómo puedo ayudarte hoy?', sender: 'bot' }],
};

const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [sessionId] = useState<string>(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { postChat } = useApiClient();
  const { language } = useLanguage();

  useEffect(() => {
    // Set initial message based on language when the provider mounts or language changes
    setMessages(initialMessages[language] || initialMessages['en']);
  }, [language]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text,
      sender: 'user',
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await postChat({ message: text, language, sessionId });
      
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: response.response,
        sender: 'bot',
        classification: response.classification,
        ticketId: response.ticketId,
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      
      const errorBotMessage: Message = {
        id: crypto.randomUUID(),
        text: language === 'es' 
          ? 'Lo siento, ocurrió un error. Por favor, inténtalo de nuevo más tarde.' 
          : 'Sorry, an error occurred. Please try again later.',
        sender: 'bot',
      };
      setMessages(prevMessages => [...prevMessages, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [language, sessionId, postChat, isLoading]);

  const value = {
    messages,
    sendMessage,
    isLoading,
    error,
    sessionId,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatProvider;
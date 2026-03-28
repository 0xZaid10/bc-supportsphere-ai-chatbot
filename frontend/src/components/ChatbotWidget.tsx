import React, { useState, useEffect, useRef, useContext } from 'react';
import LanguageContext from '../context/LanguageContext';
import { Message } from '../types';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import LanguageSelector from './LanguageSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const welcomeMessages: { [key: string]: string } = {
  en: "Hello! I'm your AI support assistant. How can I help you today?",
  es: "¡Hola! Soy tu asistente de soporte de IA. ¿Cómo puedo ayudarte hoy?",
};

const ChatbotWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useContext(LanguageContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);

    setMessages([
      {
        id: crypto.randomUUID(),
        text: welcomeMessages[language],
        sender: 'bot',
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: userInput,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          language,
          sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An unknown error occurred.');
      }

      const data = await response.json();

      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: data.response,
        sender: 'bot',
        classification: data.classification,
        ticketId: data.ticketId,
        timestamp: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get a response.';
      setError(errorMessage);
      const errorBotMessage: Message = {
        id: crypto.randomUUID(),
        text: `Sorry, I encountered an error: ${errorMessage}`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">AI Support</h2>
        <LanguageSelector />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg p-3 shadow-md">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <p className="text-center text-red-500 text-sm">{error}</p>
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatbotWidget;

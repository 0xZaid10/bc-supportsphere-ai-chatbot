export type Language = 'en' | 'es';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  classification?: string;
  ticketId?: string | null;
  timestamp: string;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

export interface ChatContextType {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  clearChat: () => void;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

// API Payloads and Responses

export interface ChatRequest {
  message: string;
  language: Language;
  sessionId: string;
}

export interface ChatResponse {
  response: string;
  classification: string;
  ticketId: string | null;
}

export interface DashboardStats {
  totalTickets: number;
  ticketsByCategory: {
    technical_issue: number;
    billing_inquiry: number;
    general_question: number;
    [key: string]: number;
  };
  ticketsByLanguage: {
    en: number;
    es: number;
    [key: string]: number;
  };
}

// Chart Data Types

export interface ChartDataPoint {
  name: string;
  value: number;
}
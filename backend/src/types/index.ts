/**
 * Defines the valid languages supported by the application.
 */
export type Language = 'en' | 'es';

/**
 * Defines the possible categories for a support ticket, as determined by the AI.
 * These are the categories the AI model is trained to classify user issues into.
 */
export type TicketCategory = 'billing' | 'bug' | 'feature' | 'account';

/**
 * Represents the structure of a request to the POST /api/chat endpoint.
 */
export interface ChatRequest {
  message: string;
  language: Language;
  sessionId: string;
}

/**
 * Represents the structure of a response from the POST /api/chat endpoint.
 */
export interface ChatResponse {
  response: string;
  classification: TicketCategory | 'none';
  ticketId: string | null;
}

/**
 * Represents the structure of the dashboard statistics response from GET /api/dashboard/stats.
 * Note: The categories here are aggregated for display purposes and may differ
 * from the more granular `TicketCategory`.
 */
export interface DashboardStatsResponse {
  totalTickets: number;
  ticketsByCategory: {
    technical_issue: number;
    billing_inquiry: number;
    general_question: number;
  };
  ticketsByLanguage: {
    en: number;
    es: number;
  };
}

/**
 * Represents a ticket record as stored in the local SQLite database.
 */
export interface Ticket {
  id: number;
  session_id: string;
  message: string;
  language: Language;
  category: TicketCategory;
  external_ticket_id: string;
  created_at: string; // ISO 8601 string format
}

/**
 * Represents the structured output from the AI classification model.
 * This is an internal type used by the AI service to decide the next action.
 */
export interface AIClassificationResult {
    classification: TicketCategory | 'none';
    shouldCreateTicket: boolean;
    reasoning: string;
}

/**
 * Represents the payload for creating a ticket in the external helpdesk system.
 */
export interface HelpdeskTicketRequest {
    subject: string;
    description: string;
    requester_language: Language;
    category: TicketCategory;
}

/**
 * Represents the response from the external helpdesk system after creating a ticket.
 */
export interface HelpdeskTicketResponse {
    ticketId: string;
    status: string;
}
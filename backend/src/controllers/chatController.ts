import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/aiService';
import { createTicket } from '../services/helpdeskService';
import db from '../db/database';
import { ChatRequest, ChatResponse, TicketCategory } from '../types';

// Define the categories for which we might create a ticket.
const TICKET_CREATION_CATEGORIES: TicketCategory[] = [
  'billing',
  'bug',
  'account',
];

/**
 * Handles incoming chat messages, processes them with the AI service,
 * creates helpdesk tickets if necessary, and returns a response.
 */
export const handleChatMessage = async (
  req: Request<{}, ChatResponse | { error: string }, ChatRequest>,
  res: Response<ChatResponse | { error: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, language, sessionId } = req.body;

    // 1. Input Validation
    if (!message || !language || !sessionId) {
      res.status(400).json({ error: 'Missing required fields: message, language, sessionId' });
      return;
    }

    if (typeof message !== 'string' || typeof sessionId !== 'string') {
        res.status(400).json({ error: 'Invalid data type for message or sessionId.' });
        return;
    }

    if (language !== 'en' && language !== 'es') {
      res.status(400).json({ error: 'Invalid language. Must be "en" or "es".' });
      return;
    }

    // 2. AI Processing
    const aiResult = await aiService.processUserMessage(
      message,
      sessionId,
      language
    );

    let ticketId: string | null = null;

    // 3. Ticket Creation Logic
    if (aiResult.shouldCreateTicket && TICKET_CREATION_CATEGORIES.includes(aiResult.classification as TicketCategory)) {
      try {
        const createdTicketId = await createTicket(
          message,
          aiResult.classification as TicketCategory,
          language
        );
        ticketId = createdTicketId;

        // 4. Persist ticket info to our local DB for dashboard stats
        db.prepare(
          'INSERT INTO tickets (classification, language, session_id, helpdesk_ticket_id) VALUES (?, ?, ?, ?)'
        ).run(aiResult.classification, language, sessionId, ticketId);

      } catch (error) {
        console.error('Failed to create helpdesk ticket or log it to the database.', error);
      }
    }

    // 5. Send Response
    res.status(200).json({
      response: aiResult.response,
      classification: aiResult.classification,
      ticketId,
    });
  } catch (error) {
    next(error);
  }
};

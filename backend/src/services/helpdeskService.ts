import { TicketCategory } from '../types';

/**
 * A mock interface for the external helpdesk API's ticket creation response.
 * In a real-world scenario, this would match the actual API response structure.
 */
interface HelpdeskTicketResponse {
  id: string;
  status: string;
  createdAt: string;
}

/**
 * Creates a ticket in the external helpdesk system.
 * This function simulates an API call to a third-party service.
 *
 * @param message The user's message for the ticket.
 * @param category The classified category of the ticket.
 * @param language The language of the user's message ('en' or 'es').
 * @returns The ID of the created ticket.
 * @throws Error if the helpdesk API is not configured or if the request fails.
 */
export const createTicket = async (
  message: string,
  category: TicketCategory,
  language: 'en' | 'es'
): Promise<string> => {
  const apiUrl = process.env.HELPDESK_API_URL;
  const apiKey = process.env.HELPDESK_API_KEY;

  if (!apiUrl || !apiKey) {
    console.error("HELPDESK_API_URL or HELPDESK_API_KEY is not configured in environment variables.");
    // In a real application, you might want to alert or have a fallback,
    // but for this challenge, we'll throw an error to indicate a configuration issue.
    throw new Error("Helpdesk service is not configured.");
  }

  try {
    // The endpoint is assumed to be '/tickets' based on common REST API conventions.
    const response = await fetch(`${apiUrl}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        subject: `New AI Chatbot Ticket: ${category}`,
        description: message,
        priority: 'medium',
        source: 'AI Chatbot',
        custom_fields: {
          language: language,
          auto_classified_category: category,
        },
      }),
    });

    if (!response.ok) {
      // Attempt to read the error body for better logging
      const errorBody = await response.text();
      console.error(`Failed to create helpdesk ticket. Status: ${response.status}, Body: ${errorBody}`);
      throw new Error(`External helpdesk API returned status ${response.status}`);
    }

    const data: HelpdeskTicketResponse = await response.json();
    
    // Assuming the response contains an 'id' field for the created ticket.
    if (!data.id) {
        console.error("Helpdesk API response did not contain a ticket ID.", data);
        throw new Error("Invalid response from helpdesk API.");
    }

    return data.id;

  } catch (error) {
    console.error("An unexpected error occurred while creating a helpdesk ticket:", error);
    // Re-throw a more generic error to be handled by the controller's error handler.
    throw new Error("Could not create a ticket in the helpdesk system due to an internal error.");
  }
};
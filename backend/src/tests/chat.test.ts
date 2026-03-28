import request from 'supertest';
import { app, server } from '../index';
import { db } from '../db/database';
import * as aiService from '../services/aiService';
import * as helpdeskService from '../services/helpdeskService';
import { AiChatResponse } from '../types';

// Mock the services to isolate the controller logic for testing
jest.mock('../services/aiService');
jest.mock('../services/helpdeskService');

const mockedAiService = aiService as jest.Mocked<typeof aiService>;
const mockedHelpdeskService = helpdeskService as jest.Mocked<typeof helpdeskService>;

describe('POST /api/chat', () => {
  beforeAll(() => {
    // Ensure the database is in a known state before tests run
    db.exec('DELETE FROM tickets');
    db.exec('DELETE FROM chat_history');
  });

  afterEach(() => {
    // Reset mocks after each test to ensure test isolation
    jest.clearAllMocks();
  });

  afterAll((done) => {
    // Gracefully close the server and database connection
    server.close(() => {
      db.close();
      done();
    });
  });

  it('should return an AI response and create a ticket for a technical issue in English', async () => {
    const mockAiResponse: AiChatResponse = {
      classification: 'technical_issue',
      response: 'It seems you have a technical issue. I have created a ticket for you.',
      language: 'en',
    };
    const mockTicketId = 'TICKET-123';

    mockedAiService.classifyAndRespond.mockResolvedValue(mockAiResponse);
    mockedHelpdeskService.createTicket.mockResolvedValue(mockTicketId);

    const requestBody = {
      message: 'My computer is not turning on.',
      language: 'en',
      sessionId: 'session-abc-123',
    };

    const res = await request(app)
      .post('/api/chat')
      .send(requestBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      response: mockAiResponse.response,
      classification: mockAiResponse.classification,
      ticketId: mockTicketId,
    });

    expect(mockedAiService.classifyAndRespond).toHaveBeenCalledWith(
      requestBody.message,
      requestBody.sessionId,
      requestBody.language
    );
    expect(mockedHelpdeskService.createTicket).toHaveBeenCalledWith(
      requestBody.message,
      mockAiResponse.classification,
      requestBody.language
    );
  });

  it('should return an AI response and create a ticket for a billing inquiry in Spanish', async () => {
    const mockAiResponse: AiChatResponse = {
      classification: 'billing_inquiry',
      response: 'Parece que tiene una consulta de facturación. He creado un ticket para usted.',
      language: 'es',
    };
    const mockTicketId = 'TICKET-456';

    mockedAiService.classifyAndRespond.mockResolvedValue(mockAiResponse);
    mockedHelpdeskService.createTicket.mockResolvedValue(mockTicketId);

    const requestBody = {
      message: 'Tengo un problema con mi factura.',
      language: 'es',
      sessionId: 'session-def-456',
    };

    const res = await request(app)
      .post('/api/chat')
      .send(requestBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      response: mockAiResponse.response,
      classification: mockAiResponse.classification,
      ticketId: mockTicketId,
    });

    expect(mockedAiService.classifyAndRespond).toHaveBeenCalledWith(
      requestBody.message,
      requestBody.sessionId,
      requestBody.language
    );
    expect(mockedHelpdeskService.createTicket).toHaveBeenCalledWith(
      requestBody.message,
      mockAiResponse.classification,
      requestBody.language
    );
  });

  it('should return an AI response without creating a ticket for a general question', async () => {
    const mockAiResponse: AiChatResponse = {
      classification: 'general_question',
      response: 'Our business hours are 9 AM to 5 PM, Monday to Friday.',
      language: 'en',
    };

    mockedAiService.classifyAndRespond.mockResolvedValue(mockAiResponse);

    const requestBody = {
      message: 'What are your business hours?',
      language: 'en',
      sessionId: 'session-ghi-789',
    };

    const res = await request(app)
      .post('/api/chat')
      .send(requestBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      response: mockAiResponse.response,
      classification: mockAiResponse.classification,
      ticketId: null,
    });

    expect(mockedAiService.classifyAndRespond).toHaveBeenCalledWith(
      requestBody.message,
      requestBody.sessionId,
      requestBody.language
    );
    expect(mockedHelpdeskService.createTicket).not.toHaveBeenCalled();
  });

  it('should return 400 if message is missing', async () => {
    const requestBody = {
      language: 'en',
      sessionId: 'session-jkl-012',
    };

    const res = await request(app)
      .post('/api/chat')
      .send(requestBody);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request body');
    expect(res.body.details).toContain('message is a required field');
  });

  it('should return 400 if language is invalid', async () => {
    const requestBody = {
      message: 'This is a test',
      language: 'fr', // Invalid language
      sessionId: 'session-mno-345',
    };

    const res = await request(app)
      .post('/api/chat')
      .send(requestBody);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request body');
    expect(res.body.details).toContain('language must be one of the following values: en, es');
  });

  it('should return 500 if AI service fails', async () => {
    const errorMessage = 'AI service is down';
    mockedAiService.classifyAndRespond.mockRejectedValue(new Error(errorMessage));

    const requestBody = {
      message: 'My app is crashing.',
      language: 'en',
      sessionId: 'session-pqr-678',
    };

    const res = await request(app)
      .post('/api/chat')
      .send(requestBody);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An internal server error occurred');
  });

  it('should return 500 if helpdesk service fails during ticket creation', async () => {
    const mockAiResponse: AiChatResponse = {
      classification: 'technical_issue',
      response: 'It seems you have a technical issue. I will create a ticket for you.',
      language: 'en',
    };
    const errorMessage = 'Helpdesk API is down';

    mockedAiService.classifyAndRespond.mockResolvedValue(mockAiResponse);
    mockedHelpdeskService.createTicket.mockRejectedValue(new Error(errorMessage));

    const requestBody = {
      message: 'My app is crashing.',
      language: 'en',
      sessionId: 'session-stu-901',
    };

    const res = await request(app)
      .post('/api/chat')
      .send(requestBody);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An internal server error occurred');
    expect(mockedHelpdeskService.createTicket).toHaveBeenCalled();
  });
});
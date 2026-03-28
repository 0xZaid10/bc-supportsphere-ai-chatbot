import request from 'supertest';
import { app, server } from '../index';
import { getDb, initDb } from '../db/database';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

describe('Dashboard API', () => {
  let db: Database.Database;

  beforeAll(() => {
    // Use an in-memory database for testing
    // The initDb function will create the schema
    initDb(':memory:');
    db = getDb();
  });

  afterEach(() => {
    // Clear all data from the tickets table after each test
    db.prepare('DELETE FROM tickets').run();
  });

  afterAll((done) => {
    db.close();
    server.close(done);
  });

  describe('GET /api/dashboard/stats', () => {
    it('should return zero counts when the database is empty', async () => {
      const res = await request(app).get('/api/dashboard/stats');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalTickets: 0,
        ticketsByCategory: {
          technical_issue: 0,
          billing_inquiry: 0,
          general_question: 0,
        },
        ticketsByLanguage: {
          en: 0,
          es: 0,
        },
      });
    });

    it('should return correct statistics for a mix of tickets', async () => {
      // Seed the database with test data
      const insertStmt = db.prepare(
        'INSERT INTO tickets (session_id, user_message, classification, language, external_ticket_id) VALUES (?, ?, ?, ?, ?)'
      );

      // Insert some data
      insertStmt.run('sess1', 'My app is broken', 'technical_issue', 'en', 'TICKET-1');
      insertStmt.run('sess2', 'Mi aplicación no funciona', 'technical_issue', 'es', 'TICKET-2');
      insertStmt.run('sess3', 'I have a question about my bill', 'billing_inquiry', 'en', 'TICKET-3');
      insertStmt.run('sess4', 'Tengo una pregunta sobre mi factura', 'billing_inquiry', 'es', 'TICKET-4');
      insertStmt.run('sess5', 'Another billing question', 'billing_inquiry', 'en', 'TICKET-5');
      insertStmt.run('sess6', 'How does this work?', 'general_question', 'en', 'TICKET-6');
      // A ticket without a classification (should not be counted in byCategory)
      insertStmt.run('sess7', 'Just saying hi', null, 'es', null);

      const res = await request(app).get('/api/dashboard/stats');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalTickets: 7,
        ticketsByCategory: {
          technical_issue: 2,
          billing_inquiry: 3,
          general_question: 1,
        },
        ticketsByLanguage: {
          en: 4,
          es: 3,
        },
      });
    });

    it('should handle cases with only one type of category or language', async () => {
        const insertStmt = db.prepare(
            'INSERT INTO tickets (session_id, user_message, classification, language, external_ticket_id) VALUES (?, ?, ?, ?, ?)'
        );
        insertStmt.run('sess1', 'My app is broken', 'technical_issue', 'en', 'TICKET-1');
        insertStmt.run('sess2', 'My app is still broken', 'technical_issue', 'en', 'TICKET-2');
        insertStmt.run('sess3', 'My app is really broken', 'technical_issue', 'en', 'TICKET-3');

        const res = await request(app).get('/api/dashboard/stats');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            totalTickets: 3,
            ticketsByCategory: {
              technical_issue: 3,
              billing_inquiry: 0,
              general_question: 0,
            },
            ticketsByLanguage: {
              en: 3,
              es: 0,
            },
        });
    });

    it('should not count tickets with un-tracked classifications or languages', async () => {
        const insertStmt = db.prepare(
            'INSERT INTO tickets (session_id, user_message, classification, language, external_ticket_id) VALUES (?, ?, ?, ?, ?)'
        );
        insertStmt.run('sess1', 'My app is broken', 'technical_issue', 'en', 'TICKET-1');
        insertStmt.run('sess2', 'Some other issue', 'feature_request', 'en', 'TICKET-2'); // Not a tracked category
        insertStmt.run('sess3', 'Bonjour', 'general_question', 'fr', 'TICKET-3'); // Not a tracked language

        const res = await request(app).get('/api/dashboard/stats');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            totalTickets: 3,
            ticketsByCategory: {
              technical_issue: 1,
              billing_inquiry: 0,
              general_question: 1,
            },
            ticketsByLanguage: {
              en: 2,
              es: 0,
            },
        });
    });
  });
});
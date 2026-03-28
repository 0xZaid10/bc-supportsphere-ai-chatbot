-- This schema is for the AI Support Chatbot application.
-- It defines the structure for storing created support tickets.

CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('technical_issue', 'billing_inquiry', 'general_question')),
    language TEXT NOT NULL CHECK(language IN ('en', 'es')),
    externalTicketId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Create indexes for faster querying on columns used in WHERE or GROUP BY clauses.
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_language ON tickets(language);
CREATE INDEX IF NOT EXISTS idx_tickets_createdAt ON tickets(createdAt);
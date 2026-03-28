import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import apiRouter from './routes';
import errorHandler from './middleware/errorHandler';
import { initializeDatabase } from './db/database';

// Initialize the database
try {
    initializeDatabase();
    console.log('Database initialized successfully.');
} catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
}

const app: Express = express();
const PORT = process.env.PORT ?? 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', apiRouter);

// Error handling middleware - should be the last middleware
app.use(errorHandler);

// Start the server only if not in a test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

export default app;

import { Request, Response, NextFunction } from 'express';
import db from '../db/database';
import { DashboardStatsResponse } from '../types';

/**
 * Retrieves and aggregates statistics for the monitoring dashboard.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The Express next middleware function.
 */
export const getDashboardStats = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 1. Get total tickets
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM tickets');
    const totalResult = totalStmt.get() as { count: number } | undefined;
    const totalTickets = totalResult?.count ?? 0;

    // 2. Get tickets by category
    const ticketsByCategory: DashboardStatsResponse['ticketsByCategory'] = {
      technical_issue: 0,
      billing_inquiry: 0,
      general_question: 0,
    };
    const categoryStmt = db.prepare('SELECT category, COUNT(*) as count FROM tickets GROUP BY category');
    const categoryResults = categoryStmt.all() as { category: string; count: number }[];

    for (const row of categoryResults) {
      if (row.category in ticketsByCategory) {
        ticketsByCategory[row.category as keyof typeof ticketsByCategory] = row.count;
      }
    }

    // 3. Get tickets by language
    const ticketsByLanguage: DashboardStatsResponse['ticketsByLanguage'] = {
      en: 0,
      es: 0,
    };
    const languageStmt = db.prepare('SELECT language, COUNT(*) as count FROM tickets GROUP BY language');
    const languageResults = languageStmt.all() as { language: string; count: number }[];

    for (const row of languageResults) {
      if (row.language in ticketsByLanguage) {
        ticketsByLanguage[row.language as keyof typeof ticketsByLanguage] = row.count;
      }
    }

    const response: DashboardStatsResponse = {
      totalTickets,
      ticketsByCategory,
      ticketsByLanguage,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    next(error);
  }
};
import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';

const router = Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Provides aggregated statistics for the monitoring dashboard, such as ticket counts by category and language.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Successful response with dashboard statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTickets:
 *                   type: number
 *                   example: 100
 *                 ticketsByCategory:
 *                   type: object
 *                   properties:
 *                     technical_issue:
 *                       type: number
 *                       example: 40
 *                     billing_inquiry:
 *                       type: number
 *                       example: 30
 *                     general_question:
 *                       type: number
 *                       example: 30
 *                 ticketsByLanguage:
 *                   type: object
 *                   properties:
 *                     en:
 *                       type: number
 *                       example: 75
 *                     es:
 *                       type: number
 *                       example: 25
 *       500:
 *         description: Internal server error.
 */
router.get('/stats', getDashboardStats);

export default router;
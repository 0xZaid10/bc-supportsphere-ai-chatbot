import { Router } from 'express';
import chatRouter from './chatRoutes';
import dashboardRouter from './dashboardRoutes';

const router = Router();

router.use('/chat', chatRouter);
router.use('/dashboard', dashboardRouter);

export default router;